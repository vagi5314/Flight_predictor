# ✈️ AeroMetric: Flight Delay Predictor
### *A Data Science project to understand and predict flight delays*

[![Python](https://img.shields.io/badge/Python-3.12+-blue.svg)](https://www.python.org/)
[![Next.js](https://img.shields.io/badge/Next.js-15-black.svg)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-green.svg)](https://fastapi.tiangolo.com/)
[![LightGBM](https://img.shields.io/badge/LightGBM-ML-orange.svg)](https://lightgbm.readthedocs.io/)

---

## 🌟 What is this project?
AeroMetric is a tool that predicts the probability of a flight being delayed. Instead of just giving a "Yes" or "No" answer, it explains the reasons behind the prediction—such as the airline's history or the time of departure.

I built this to practice handling a large dataset (5.8 million flights) and to create a user-friendly dashboard where anyone can test a flight route.

### 📸 Dashboard Preview
![AeroMetric Dashboard](./docs/assets/dashboard.png)
*A simple interface to enter flight details and see the risk analysis in real-time.*

---

## 🏗️ How it Works

The project is split into two main parts: a **Backend** that does the math and a **Frontend** that shows the results.

### The System Flow
```mermaid
graph LR
    A[Raw Data] --> B[Cleaned Data]
    B --> C[ML Model]
    C --> D[FastAPI Server]
    D --> E[React Dashboard]
```

### What I did to make it work:
1.  **Data Cleaning**: I started with 5.8 million rows of data. To make it run fast on a normal computer, I converted the files to **Parquet** format and optimized the data types to save memory.
2.  **The Model**: I used **LightGBM**, a powerful tool for tabular data. It's fast and handles categories (like Airport codes) very well.
3.  **The "Why" (Explainability)**: I used **SHAP values**. This allows the app to say, *"This flight is risky because it's a late-night departure,"* making the AI easier to trust.
4.  **The App**: I built a fast API using **FastAPI** and a modern, clean dashboard using **Next.js**.

---

## 🧪 What I Discovered (Data Insights)

Before building the model, I tested a few ideas to see what actually causes delays:

- **Time of Day**: I found that flights departing between **6 PM and 10 PM** have a much higher risk of delay.
- **The Airline**: Some airlines are consistently more punctual than others, regardless of the route.
- **Distance**: Surprisingly, the distance of the flight didn't have a strong impact on whether it would be delayed.

**Key Finding**: I noticed that low-cost carriers (like Spirit or Frontier) are harder to predict. Their tight schedules mean a small problem can cause a big delay very quickly.

---

## 🚀 How to run it locally

### 1. Setup the Backend
```bash
cd backend
pip install -r ../requirements.txt
uvicorn api:app --reload
```

### 2. Setup the Frontend
```bash
cd frontend
npm install
npm run dev
```

---

**Created as a learning project in Data Science and Full-Stack Engineering.**
