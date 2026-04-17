# ✈️ AeroMetric: Aviation Intelligence Hub
### *Predicting Flight Delays with Machine Learning & Production Engineering*

[![Python](https://img.shields.io/badge/Python-3.12+-blue.svg)](https://www.python.org/)
[![Next.js](https://img.shields.io/badge/Next.js-15-black.svg)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-green.svg)](https://fastapi.tiangolo.com/)
[![LightGBM](https://img.shields.io/badge/LightGBM-ML-orange.svg)](https://lightgbm.readthedocs.io/)

---

## 🌟 The Mission
Flight delays aren't just annoying—they cost the global economy billions. Most tools just tell you *that* a flight is delayed. **AeroMetric** does something different: it predicts the **probability of a delay** and explains **exactly why** it's happening.

I built this to demonstrate how to handle "Big Data" (5.8M+ records) on local hardware and transform it into a scalable, production-ready intelligence tool.

### 📸 Quick Preview
* [Link to Live Demo] — *Experience the risk simulator in real-time.*

---

## 🛠️ How it Works (The "Under the Hood")

AeroMetric isn't just a model; it's a full-stack ML pipeline designed for reliability and transparency.

### 1. The Data Engine (Medallion Architecture)
I processed over **5.8 million historical flights** using a three-tier pipeline:
- **Bronze (Raw)**: Ingested massive CSV files from the BTS Aviation dataset.
- **Silver (Optimized)**: Migrated to **Apache Parquet** and implemented **Memory Downcasting**. This reduced the memory footprint by 50% and increased load speeds by 10x.
- **Gold (Features)**: Applied target encoding and temporal cycle encoding (sin/cos) to capture the "rhythm" of flight schedules.

### 2. The ML Brain
I chose **LightGBM** for its speed and ability to handle categorical data (Airports, Airlines) without exploding the feature space. 
- **No Black Boxes**: I integrated **SHAP (Shapley Additive Explanations)**. When the model predicts a high risk, the dashboard tells you if it's because of the carrier, the hour of departure, or the route.

### 3. The Production Stack
- **Backend**: A high-performance **FastAPI** server containerized with **Docker**.
- **Frontend**: A premium, "Glassmorphism" UI built with **Next.js 15** and **Tailwind CSS**.
- **Deployment**: A hybrid cloud approach using **Vercel** (Frontend) and **Railway/Render** (Backend).

---

## 🚀 Get Started Locally

### Prerequisites
- Python 3.12+
- Node.js 18+

### Installation
1. **Clone the repo**
   ```bash
   git clone https://github.com/your-username/aviation-project.git
   cd aviation-project
   ```

2. **Run the Backend**
   ```bash
   cd backend
   pip install -r ../requirements.txt
   uvicorn api:app --reload
   ```

3. **Run the Frontend**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

---

## 🎓 Engineering Key Takeaways
- **Scale over Recency**: I intentionally used the 2015 dataset to process 5.8M rows. Handling this volume of data locally is a bigger engineering challenge than using a tiny modern dataset.
- **Combatting the "COVID Anomaly"**: By using 2015 data, the model learns standard aviation patterns rather than the chaos of the 2020-2022 pandemic.
- **Performance First**: By baking the optimized Parquet file into the Docker image, the API starts instantly without needing an external database.

---

**Developed with ❤️ by [Your Name]**  
*Aspiring Data Scientist | ML Engineer*
