import uvicorn
import json
import os
import pickle
import numpy as np
import shap
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from contextlib import asynccontextmanager

ml_data = {}


@asynccontextmanager
async def lifespan(app: FastAPI):
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    model_path = os.path.join(base_dir, 'app', 'lgbm_model.pkl')
    aggregates_path = os.path.join(base_dir, 'data', 'processed', 'aggregates.json')

    print("[startup] INITIALIZING FAST-START MODE...")

    try:
        if os.path.exists(model_path):
            with open(model_path, 'rb') as f:
                ml_data['delay_model'] = pickle.load(f)
                ml_data['explainer'] = shap.TreeExplainer(ml_data['delay_model'])
            print("[startup] Model + SHAP explainer loaded")
        else:
            print("[startup] WARNING: lgbm_model.pkl missing. /predict will return 503.")
    except Exception as e:
        print(f"[startup] Model Load Error: {e}")

    try:
        if os.path.exists(aggregates_path):
            with open(aggregates_path) as f:
                agg = json.load(f)
            present_hourly = agg.get('hourly', {})
            ml_data['global_chart_data'] = [
                {"time": f"{h:02d}:00", "system_delay_rate": present_hourly.get(f"{h:02d}:00", 0.0)}
                for h in range(24)
            ]
            ml_data['airline_data'] = [
                {"carrier": c, "risk": r}
                for c, r in agg.get('airline', {}).items()
            ]
            ml_data['route_lookup'] = agg.get('route', {})
            row_count = agg.get('row_count', 0)
            ml_data['tech_stats'] = {
                "rows_processed": f"{row_count:,}",
                "optimization": "Pre-computed Aggregates (memory-light)",
                "model": "LightGBM"
            }
            print(f"[startup] Aggregates loaded: {row_count:,} source rows; "
                  f"{len(ml_data['route_lookup']):,} routes; "
                  f"{len(ml_data['airline_data'])} carriers")
        else:
            print("[startup] WARNING: aggregates.json missing. Analytics will return synthetic data.")
            ml_data['global_chart_data'] = [{"time": f"{h:02d}:00", "system_delay_rate": 15.0} for h in range(24)]
            ml_data['airline_data'] = [{"carrier": c, "risk": 20.0}
                                       for c in ['AA', 'DL', 'UA', 'WN', 'AS', 'NK', 'B6']]
            ml_data['route_lookup'] = {}
            ml_data['tech_stats'] = {"rows_processed": "Simulated", "optimization": "Enabled", "model": "LightGBM"}
    except Exception as e:
        print(f"[startup] Aggregates Load Error: {e}")

    yield
    ml_data.clear()


app = FastAPI(
    title="Aviation Intelligence API",
    lifespan=lifespan,
    docs_url=None,
    redoc_url=None,
    openapi_url=None,
)


@app.middleware("http")
async def strip_proxy_headers(request, call_next):
    response = await call_next(request)
    for header in ("x-render-origin-server", "x-render-internal-only"):
        if header in response.headers:
            del response.headers[header]
    return response


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


class FlightRequest(BaseModel):
    month: int
    day_of_week: int
    airline: str
    origin_airport: str
    destination_airport: str
    scheduled_departure: int
    distance: int


@app.api_route("/health", methods=["GET", "HEAD"])
def health_check():
    return {
        "status": "online",
        "model_loaded": 'delay_model' in ml_data,
        "data_loaded": 'global_chart_data' in ml_data,
        "routes_cached": len(ml_data.get('route_lookup', {}))
    }


@app.api_route("/analytics/global", methods=["GET", "HEAD"])
def get_global_analytics():
    return {
        "hourly_chart": ml_data.get('global_chart_data', []),
        "tech_stats": ml_data.get('tech_stats', {})
    }


@app.api_route("/analytics/airlines", methods=["GET", "HEAD"])
def get_airline_analytics():
    return {"airline_chart": ml_data.get('airline_data', [])}


@app.post("/predict")
def predict_delay(request: FlightRequest):
    if 'delay_model' not in ml_data:
        raise HTTPException(status_code=503, detail="Model weights not found. Run 02_train_model.py")

    if request.origin_airport == request.destination_airport:
        raise HTTPException(status_code=400, detail="Origin and destination airports cannot be the same.")

    if request.distance <= 0:
        raise HTTPException(status_code=400, detail="Flight distance must be a positive value.")

    if request.scheduled_departure < 0 or request.scheduled_departure > 2359:
        raise HTTPException(status_code=400, detail="Scheduled departure must be between 0000 and 2359.")

    import pandas as pd

    hours = request.scheduled_departure // 100
    dep_hour_sin = np.sin(2 * np.pi * hours / 24)
    dep_hour_cos = np.cos(2 * np.pi * hours / 24)

    global_mean = ml_data.get('encodings', {}).get('GLOBAL_MEAN', 0.2)
    airline_enc = ml_data.get('encodings', {}).get('AIRLINE', {}).get(request.airline, global_mean)
    origin_enc = ml_data.get('encodings', {}).get('ORIGIN_AIRPORT', {}).get(request.origin_airport, global_mean)
    inter_key = f"{request.airline}_{request.origin_airport}"
    inter_enc = ml_data.get('encodings', {}).get('INTER', {}).get(inter_key, global_mean)

    input_df = pd.DataFrame([{
        'MONTH': np.int8(request.month),
        'DAY_OF_WEEK': np.int8(request.day_of_week),
        'AIRLINE': request.airline,
        'ORIGIN_AIRPORT': request.origin_airport,
        'DESTINATION_AIRPORT': request.destination_airport,
        'SCHEDULED_DEPARTURE': np.int16(request.scheduled_departure),
        'DISTANCE': np.int16(request.distance),
        'dep_hour_sin': dep_hour_sin,
        'dep_hour_cos': dep_hour_cos,
        'AIRLINE_target_enc': airline_enc,
        'ORIGIN_AIRPORT_target_enc': origin_enc,
        'airline_airport_inter_enc': inter_enc
    }])

    for col in ['AIRLINE', 'ORIGIN_AIRPORT', 'DESTINATION_AIRPORT']:
        input_df[col] = input_df[col].astype("category")

    prob = float(ml_data['delay_model'].predict(input_df)[0])
    shap_values = ml_data['explainer'].shap_values(input_df)
    target_shap = shap_values[1][0] if isinstance(shap_values, list) else shap_values[0]
    shap_data = [{"feature": col, "impact": float(val)} for col, val in zip(input_df.columns, target_shap)]

    route_key = f"{request.origin_airport}_{request.destination_airport}"
    route_lookup = ml_data.get('route_lookup', {})
    avg_route_risk = route_lookup.get(route_key, 20.0)

    hour_str = f"{hours:02d}:00"
    hour_entry = next((e for e in ml_data.get('global_chart_data', []) if e['time'] == hour_str), None)
    avg_hour_risk = hour_entry['system_delay_rate'] if hour_entry else 20.0

    return {
        "probability": prob,
        "risk_level": "HIGH" if prob > 0.6 else "MODERATE" if prob > 0.3 else "LOW",
        "advisory": "Critical Delay Anticipated" if prob > 0.6 else "Standard Monitoring" if prob > 0.3 else "Normal Operations",
        "shap_values": shap_data,
        "carrier": request.airline,
        "origin": request.origin_airport,
        "dest": request.destination_airport,
        "avg_route_risk": avg_route_risk,
        "avg_hour_risk": avg_hour_risk
    }


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8080))
    print(f"--- DYNAMIC PORT STARTUP ---")
    print(f"Server starting on port {port} at 0.0.0.0...")
    uvicorn.run(app, host="0.0.0.0", port=port)
