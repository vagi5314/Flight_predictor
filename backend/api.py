import uvicorn

# ... (keep all imports)
# [I will keep the imports from the Read result]

import pandas as pd
import numpy as np
import shap
import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from contextlib import asynccontextmanager

ml_data = {}

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Paths relative to project root (one level up from backend/)
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    model_path = os.path.join(base_dir, 'app', 'lgbm_model.pkl')
    parquet_path = os.path.join(base_dir, 'data', 'processed', 'flights_optimized.parquet')
    
    # 1. Safely load the model
    try:
        if os.path.exists(model_path):
            with open(model_path, 'rb') as f:
                ml_data['delay_model'] = pickle.load(f)
                ml_data['explainer'] = shap.TreeExplainer(ml_data['delay_model'])
        else:
            print("WARNING: lgbm_model.pkl missing.")
    except Exception as e:
        print(f"Model Load Error: {e}")

    # 2. Safely load the Data & Calculate Analytics
    try:
        if os.path.exists(parquet_path):
            df = pd.read_parquet(parquet_path)
            
            # Global Baseline
            if 'is_delayed' not in df.columns:
                df['is_delayed'] = 0 # Fallback
            
            avg_delay = df['is_delayed'].mean() * 100
            
            # Hourly Stats
            df['HOUR'] = (df['SCHEDULED_DEPARTURE'] // 100).clip(0, 23)
            hourly = df.groupby('HOUR')['is_delayed'].mean() * 100
            
            # Store reference for route/hour lookups in /predict
            ml_data['loaded_df'] = df
            
            # Precompute target encodings for inference
            # Ensure is_delayed exists for encoding
            if 'is_delayed' not in df.columns and 'ARRIVAL_DELAY' in df.columns:
                df['is_delayed'] = (df['ARRIVAL_DELAY'] > 15).astype(int)
            elif 'is_delayed' not in df.columns:
                df['is_delayed'] = 0  # Fallback
            
            ml_data['encodings'] = {
                'AIRLINE': df.groupby('AIRLINE', observed=True)['is_delayed'].mean().to_dict(),
                'ORIGIN_AIRPORT': df.groupby('ORIGIN_AIRPORT', observed=True)['is_delayed'].mean().to_dict(),
            }
            # Compute Interaction term
            df['airline_airport_inter'] = df['AIRLINE'].astype(str) + "_" + df['ORIGIN_AIRPORT'].astype(str)
            ml_data['encodings']['INTER'] = df.groupby('airline_airport_inter')['is_delayed'].mean().to_dict()
            global_mean = df['is_delayed'].mean()
            ml_data['encodings']['GLOBAL_MEAN'] = global_mean if not pd.isna(global_mean) else 0.2
            
            # Airline Performance
            airline_perf = (df.groupby('AIRLINE', observed=True)['is_delayed'].mean() * 100).sort_values(ascending=False)
            
            ml_data['global_chart_data'] = [
                {"time": f"{h:02d}:00", "system_delay_rate": round(hourly.get(h, avg_delay), 1)} 
                for h in range(24)
            ]
            
            ml_data['airline_data'] = [
                {"carrier": k, "risk": round(v, 1)} 
                for k, v in airline_perf.to_dict().items()
            ]
            
            ml_data['tech_stats'] = {
                "rows_processed": f"{len(df):,} Records",
                "optimization": "CSV → Parquet (PyArrow)",
                "memory_reduction": "Downcasted",
                "model": "LightGBM (Gradient Boosting)",
                "interpretability": "SHAP (Shapley Additive Explanations)"
            }
        else:
            # Synthetic Fallbacks for UI development if file isn't ready
            ml_data['global_chart_data'] = [{"time": f"{h:02d}:00", "system_delay_rate": 15.0} for h in range(24)]
            ml_data['airline_data'] = [{"carrier": c, "risk": 20.0} for c in ['AA', 'DL', 'UA', 'WN', 'AS', 'NK', 'B6']]
            ml_data['tech_stats'] = {"rows_processed": "Simulated", "optimization": "Enabled", "memory_reduction": "N/A", "model": "LightGBM", "interpretability": "SHAP"}

    except Exception as e:
        print(f"Analytics Calc Error: {e}")
        
    yield
    ml_data.clear()

app = FastAPI(title="Aviation Intelligence API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
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

@app.get("/health")
def health_check():
    return {
        "status": "online", 
        "model_loaded": 'delay_model' in ml_data,
        "data_loaded": 'global_chart_data' in ml_data
    }

@app.get("/analytics/global")
def get_global_analytics():
    return {
        "hourly_chart": ml_data.get('global_chart_data', []),
        "tech_stats": ml_data.get('tech_stats', {})
    }

@app.get("/analytics/airlines")
def get_airline_analytics():
    return {"airline_chart": ml_data.get('airline_data', [])}

@app.post("/predict")
def predict_delay(request: FlightRequest):
    if 'delay_model' not in ml_data:
        raise HTTPException(status_code=503, detail="Model weights not found. Run 02_train_model.py")

    # --- Physicality Guardrails ---
    if request.origin_airport == request.destination_airport:
        raise HTTPException(status_code=400, detail="Origin and destination airports cannot be the same.")

    if request.distance <= 0:
        raise HTTPException(status_code=400, detail="Flight distance must be a positive value.")

    if request.scheduled_departure < 0 or request.scheduled_departure > 2359:
        raise HTTPException(status_code=400, detail="Scheduled departure must be between 0000 and 2359.")

    # Calculate Engineered Features
    hours = request.scheduled_departure // 100
    dep_hour_sin = np.sin(2 * np.pi * hours / 24)
    dep_hour_cos = np.cos(2 * np.pi * hours / 24)
    
    global_mean = ml_data.get('encodings', {}).get('GLOBAL_MEAN', 0.2)
    airline_enc = ml_data.get('encodings', {}).get('AIRLINE', {}).get(request.airline, global_mean)
    origin_enc = ml_data.get('encodings', {}).get('ORIGIN_AIRPORT', {}).get(request.origin_airport, global_mean)
    inter_key = f"{request.airline}_{request.origin_airport}"
    inter_enc = ml_data.get('encodings', {}).get('INTER', {}).get(inter_key, global_mean)

    # Prepare input (must match exactly what LightGBM was trained on)
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

    # Probability
    prob = float(ml_data['delay_model'].predict(input_df)[0])
    
    # SHAP
    shap_values = ml_data['explainer'].shap_values(input_df)
    target_shap = shap_values[1][0] if isinstance(shap_values, list) else shap_values[0]
    shap_data = [{"feature": col, "impact": float(val)} for col, val in zip(input_df.columns, target_shap)]

    # Route and Hour Averages for meaningful comparison
    avg_route_risk = 20.0  # fallback
    avg_hour_risk = 20.0   # fallback
    
    if 'loaded_df' in ml_data:
        df = ml_data['loaded_df']
        
        # Average delay rate for this specific route (origin → destination)
        route_mask = (df['ORIGIN_AIRPORT'] == request.origin_airport) & (df['DESTINATION_AIRPORT'] == request.destination_airport)
        route_subset = df[route_mask]
        if len(route_subset) > 0:
            avg_route_risk = round(float(route_subset['is_delayed'].mean() * 100), 1)
        
        # Average delay rate for flights at this hour
        flight_hour = request.scheduled_departure // 100
        hour_mask = df['HOUR'] == flight_hour
        hour_subset = df[hour_mask]
        if len(hour_subset) > 0:
            avg_hour_risk = round(float(hour_subset['is_delayed'].mean() * 100), 1)

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
    # Railway provides the PORT environment variable.
    # We MUST listen on 0.0.0.0 to be accessible externally.
    port = int(os.environ.get("PORT", 8000))
    print(f"🚀 Server starting on port {port}...")
    uvicorn.run(app, host="0.0.0.0", port=port)

