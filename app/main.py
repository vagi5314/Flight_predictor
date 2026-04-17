import streamlit as st
import pandas as pd
import pickle
import numpy as np
import shap
import matplotlib.pyplot as plt

st.set_page_config(page_title="Flight Ops Dashboard", layout="wide")

st.sidebar.title("Navigation")
page = st.sidebar.radio("Select View", ["Gate Advisory (Predictor)", "Historical Analytics"])
st.sidebar.markdown("---")

if page == "Gate Advisory (Predictor)":
    st.title("🛫 Flight Operations & Advisory")
    st.markdown("""
    Welcome to the predictive logistics system. This tool is designed for Gate Agents and Operations Managers. 
    Instead of waiting for a delay to cascade into missed connections, enter the flight details below to proactively 
    predict delays and receive automated rebooking advisories.
    """)

    st.sidebar.header("Input Flight Details")

    airlines = ['AA', 'DL', 'UA', 'WN', 'B6', 'AS', 'NK']
    airports = ['ATL', 'DFW', 'DEN', 'ORD', 'LAX', 'JFK', 'SFO', 'LAS', 'MCO', 'EWR', 
                'CLT', 'PHX', 'IAH', 'MIA', 'BOS', 'MSP', 'DTW', 'FLL', 'PHL', 'LGA']

    col1, col2 = st.sidebar.columns(2)
    with col1:
        month = st.selectbox("Month", range(1, 13))
        origin = st.selectbox("Origin Airport", airports)
    with col2:
        day = st.selectbox("Day of Week (1=Mon)", range(1, 8))
        dest = st.selectbox("Destination Airport", airports)

    airline = st.sidebar.selectbox("Airline Carrier", airlines)
    scheduled_dep = st.sidebar.slider("Scheduled Departure (0-2359)", 0, 2359, 1200)
    distance = st.sidebar.slider("Flight Distance (miles)", 100, 3000, 1000)

    input_data = pd.DataFrame([{
        'MONTH': np.int8(month),
        'DAY_OF_WEEK': np.int8(day),
        'AIRLINE': airline,
        'ORIGIN_AIRPORT': origin,
        'DESTINATION_AIRPORT': dest,
        'SCHEDULED_DEPARTURE': np.int16(scheduled_dep),
        'DISTANCE': np.int16(distance)
    }])

    cat_cols = ['AIRLINE', 'ORIGIN_AIRPORT', 'DESTINATION_AIRPORT']
    for col in cat_cols:
        input_data[col] = input_data[col].astype("category")

    st.markdown("---")

    @st.cache_resource
    def load_model():
        try:
            with open('app/lgbm_model.pkl', 'rb') as f:
                return pickle.load(f)
        except FileNotFoundError:
            return None

    model = load_model()

    if st.sidebar.button("Run Prediction Analytics"):
        if model is None:
            st.error("Model not found. Please train the module first.")
        else:
            with st.spinner('Calculating delay probability...'):
                prob = model.predict(input_data)[0]
                
                st.subheader("Prediction Results")
                c1, c2, c3 = st.columns(3)
                
                c1.metric(label="Probability of >15 Min Delay", value=f"{prob*100:.1f}%")
                
                if prob > 0.6:
                    c2.error("High Risk of Cascading Delay.")
                    st.warning("⚠️ Gate Agent Advisory: Automatically push mobile alerts to passengers with direct connections under 45 minutes in the destination airport.")
                elif prob > 0.3:
                    c2.warning("Moderate Risk. Monitor situation.")
                    st.info("ℹ️ Gate Agent Advisory: No immediate action required. Stage a backup cleaning crew at destination.")
                else:
                    c2.success("Flight likely on time.")
                    st.success("✅ Gate Agent Advisory: Standard operations. No proactive measures needed.")
                
                st.markdown("### Why? (Automated Root Cause Diagnostics)")
                
                try:
                    explainer = shap.TreeExplainer(model)
                    shap_values = explainer.shap_values(input_data)
                    
                    if isinstance(shap_values, list):
                        shap_values_to_plot = shap_values[1] 
                    else:
                        shap_values_to_plot = shap_values

                    fig, ax = plt.subplots(figsize=(6, 4))
                    shap.decision_plot(explainer.expected_value[1] if isinstance(explainer.expected_value, list) else explainer.expected_value, 
                                       shap_values_to_plot, 
                                       features=input_data, 
                                       feature_names=input_data.columns.tolist())
                    st.pyplot(fig)
                except Exception as e:
                    pass
    else:
        st.info("👈 Enter flight details in the sidebar and click 'Run Prediction Analytics'.")

elif page == "Historical Analytics":
    st.title("📊 System-Wide Delay Analytics")
    st.markdown("Explore historical delay trends to identify systemic bottlenecks across our operations.")
    
    @st.cache_data
    def load_historical_data():
        try:
            return pd.read_parquet('data/processed/flights_optimized.parquet')
        except Exception:
            return None
            
    df = load_historical_data()
    
    if df is None:
        st.warning("Historical data not found. Please ensure the pipeline has been run.")
    else:
        df['Departure Hour'] = (df['SCHEDULED_DEPARTURE'] // 100).clip(0, 23)
        
        col1, col2 = st.columns(2)
        
        with col1:
            st.subheader("Delay Rate by Time of Day")
            st.markdown("Late afternoon/evening flights suffer cascading network delays.")
            time_delay = df.groupby('Departure Hour')['is_delayed'].mean() * 100
            st.bar_chart(time_delay)
            
        with col2:
            st.subheader("Delay Rate by Airline Carrier")
            st.markdown("Operational efficiency varies drastically between carriers.")
            carrier_delay = df.groupby('AIRLINE')['is_delayed'].mean().sort_values(ascending=False) * 100
            st.bar_chart(carrier_delay)
            
        st.markdown("---")
        st.subheader("Delay Risk by Day of Week")
        st.markdown("1 = Monday, 7 = Sunday")
        day_stats = df.groupby('DAY_OF_WEEK')['is_delayed'].mean() * 100
        st.line_chart(day_stats)
