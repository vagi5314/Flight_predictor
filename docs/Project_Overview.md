# Flight Delay Intelligence Dashboard - Project Overview

## 🎯 Project Goal
Build a professional, end-to-end data science pipeline to predict flight delays using large-scale historical data. The final output is a "recruiter-ready" portfolio project featuring a machine learning model and an interactive Streamlit dashboard.

## 📖 Plain English Explanation
**What are we solving?**
We are transforming a massive pile of government flight logs into a "Prediction Machine." Instead of just seeing that flights are often delayed, we are building a tool that can look at a specific flight's details (Airline, Route, Time) and calculate the probability of a delay.

**The Story of the Project:**
1. **Investigation (EDA):** Playing detective with 5.8M+ records to find patterns (e.g., "Is 5 PM the worst time to fly?").
2. **Training (ML):** Teaching a computer to recognize the "fingerprint" of a delayed flight using a Random Forest classifier.
3. **The Tool (Deployment):** Creating a Streamlit app where a user can either explore these patterns or enter their own flight details to get a delay prediction.

---

## 🛠️ Project Blueprint

### 1. The Data (The Ingredients)
- **Source:** US Department of Transportation (2015 Flight Delays and Cancellations via Kaggle).
- **Scale:** ~5.8 million records.
- **Key Components:** `flights.csv`, `airlines.csv`, `airports.csv`.

### 2. The Pipeline & MLOps Approach
- **Data Engineering & Optimization:**
    - Stratified sampling of 5.8M rows (10% sample for local dev) to ensure performance.
    - Downcasting data types and converting CSVs to `Parquet` format (reducing memory footprint by ~50%).
- **EDA:** Publication-quality visualizations to uncover delay drivers.
- **Feature Engineering:**
    - Creating a binary target: `is_delayed` (1 if delay > 15 mins).
    - Extracting `hour` and `month` from timestamps.
- **Modeling:**
    - Baseline: Logistic Regression.
    - Final: LightGBM Classifier (natively handles categorical variable high-cardinality without massive one-hot encoding overhead).
    - Metric: F1-Score / PR-AUC to handle class imbalance.
- **Deployment:** Streamlit Dashboard with dynamic user inputs and real-time inference.

---

## 🚀 The "Elite" Level-Up (Engineering Best Practices)
To stand out, this project leans heavily into **engineering optimization** rather than just pure statistics. Recruiters look for interns who write production-ready code:
- **Big Data Handling on Local Hardware:** Demonstrating how to successfully process a 5.8M row dataset without Out-Of-Memory (OOM) errors. 
- **Modular Codebase:** Moving away from a monolithic messy Jupyter Notebook into a professional folder structure (`src/`, `data/`, `app/`).
- **Local Model Interpretability:** Using SHAP to provide a "Why?" explanation for individual flight predictions inside the Streamlit app.
---

## 🎤 Interview Strategy: "The 2015 Data Question"
**Question:** *"Why use data from 2015? It's too old."*
**The Winning Answer:**
1. **Avoid the COVID Anomaly:** 2020-2022 data is "noisy" due to pandemic disruptions (ghost flights, staffing shortages) which don't represent normal aviation logic. 2015 provides a stable baseline.
2. **Demonstrate Scale:** Processing 5.8 million rows proves the ability to handle "Big Data" and optimize memory, which is more impressive than using a small, clean, modern dataset.
3. **Data Integrity:** The 2015 set is a "Gold Standard" dataset—complete, cleaned, and comprehensive.
