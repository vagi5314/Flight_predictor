# AeroMetric: Aviation Delay Prediction

A data science project analyzing 5.8M+ flight records to predict delay probabilities and identify structural operational risks.

## 📌 The Problem
Aviation delays are systemic. While most tools simply track delays, this project aims to predict the **probability of a delay** and provide a mathematical explanation for that risk using Explainable AI (SHAP).

## 🛠️ Technical Implementation

### 1. Data Engineering (Handling 5.8M Rows)
Processing this volume of data on local hardware required specific optimizations to avoid Out-of-Memory (OOM) crashes:
- **Storage**: Migrated raw CSVs to **Apache Parquet**, reducing disk usage and increasing load speeds by 10x.
- **Memory**: Implemented **type downcasting** (e.g., `float64` $\rightarrow$ `float32`, `int64` $\rightarrow$ `int16`), allowing the full dataset to fit in RAM.
- **Encoding**: Used **Target Encoding** for high-cardinality features (Airports/Airlines) and **Sine/Cosine encoding** for departure times to capture the 24-hour cycle.

### 2. The ML Pipeline
- **Model**: LightGBM Classifier. Chosen for its efficiency with categorical data and speed.
- **Interpretability**: Integrated **SHAP** to decompose every prediction. Instead of a "black box," the system shows exactly which feature (e.g., Carrier or Hour) pushed the risk score up.
- **Architecture**: 
  - **Backend**: FastAPI (Python) containerized with Docker.
  - **Frontend**: Next.js 15 (React) with a glassmorphism UI.

### 📸 Dashboard Preview
![Dashboard](./docs/assets/dashboard.png)

---

## 🧪 Statistical Findings
Before modeling, I validated the following hypotheses:

| Hypothesis | Test | Result | Conclusion |
| :--- | :--- | :--- | :--- |
| **Time of Day** | Chi-Square | ✅ Validated | Peak risk between 18:00-22:00. |
| **Airline Choice** | ANOVA | ✅ Validated | Carrier is a structural driver of risk. |
| **Distance** | Pearson | ❌ Rejected | Distance is not a strong predictor of delay. |

### Key Discovery: The LCC Volatility
Analysis of False Negatives showed that Low-Cost Carriers (e.g., Spirit, Frontier) have a higher "unpredictable" delay rate due to tighter operational turnarounds, creating a "predictability ceiling" for schedule-based models.

---

## 🚀 Quick Start

### Backend
```bash
cd backend
pip install -r ../requirements.txt
uvicorn api:app --reload
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

---

**Project Goal**: Demonstrate the ability to handle large-scale data, implement rigorous statistical validation, and deploy a full-stack ML application.
