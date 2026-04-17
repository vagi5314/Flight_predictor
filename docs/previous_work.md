# PROJECT HANDOVER: Aviation Intelligence - Data Science Investigation

## 🎯 PROJECT GOAL
**Transition from a generic Machine Learning "prediction" project to a professional Data Science "research" project.**
The objective is to investigate the statistical drivers of aviation delays using real-world datasets (BTS/Kaggle), moving beyond simple accuracy to focus on **causality, domain-driven features, and statistical significance.**

---

## 🛠️ CURRENT TECHNICAL STACK & ARCHITECTURE
The project follows a "Medallion Architecture" to manage large-scale data (5.8M+ rows) efficiently.

### 📂 File Structure & Data Flow
1.  **RAW LAYER:** `data/raw/flights.csv` (Real-world, massive CSV).
2.  **SILVER LAYER (Optimized):** `data/processed/flights_optimized.parquet` (Full dataset, downcasted, cleaned, and stored in columnar format for speed).
3.  **GOLD LAYER (Research Sample):** `data/processed/flights_sampled.parquet` (**500,000 rows**, created via **Stratified Sampling** to maintain the original delay ratio. This is the primary file for EDA and rapid iteration).

### ⚙️ Core Scripts
*   `src/00_ingest_real_data.py`: Robust ETL. Performs ingestion, statistical profiling (mean, median, skewness), and sanitization (fixing mixed-type airport codes).
*   `src/00_sample_data.py`: Performs **Stratified Sampling** to create a "statistically representative miniature" of the big data.
*   `notebooks/01_eda_and_hypothesis_testing.ipynb`: The current research instrument (see "Current Task" below).

---

## 🧬 THE "DATA SCIENCE" PHILOSOPHY (CRITICAL)
**DO NOT treat this as a standard ML coding task. Follow these principles:**

1.  **Avoid "AI-Perfect" Code:** The code should look like a researcher's work. It should document "the struggle"—handling messy strings, managing nulls, and explaining *why* certain cleaning steps were taken.
2.  **Scientific Rigor over Accuracy:** Don't just chase a higher AUC. Use **Hypothesis Testing** (Chi-Square, ANOVA, Pearson correlation) to prove if observed patterns (like time-of-day or airline performance) are statistically significant.
3.  **Domain-Driven Feature Engineering:** Features must be derived from aviation logic (e.g., "Congestion Indices" or "Temporal Periodicity"), not just mathematical transformations.
4.  **Error Analysis:** Instead of just reporting error rates, investigate the **Residuals**. *Why* does the model fail on specific routes or airlines?

---

## 🚀 CURRENT STATUS & NEXT STEPS

### 📍 CURRENT STEP: [In-Progress] Exploratory Data Analysis (EDA) & Hypothesis Testing
**The user is currently attempting to run the research notebook: `notebooks/01_eda_and_hypothesis_testing.ipynb`.**

**Immediate Task for the next model:**
1.  **Execute the Notebook:** Run the cells in `notebooks/01_eda_and_hypothesis_testing.ipynb`.
2.  **Analyze the Results:**
    *   Capture the **P-values** from the Chi-Square and ANOVA tests.
    *   Observe the **Distribution** of delays (check for skewness and outliers).
    *   Analyze the **Correlation** between distance and delay.
3.  **Synthesize Findings:** Interpret these results. Do the patterns hold true? Is the "Time of Day" or "Airline" a statistically significant driver?
4.  **Prepare for Feature Engineering:** Use these scientific findings to suggest specific, domain-informed features for the next phase.

### ⏭️ UPCOMING PIPELINE
1.  **Step 3: Feature Engineering** (Based on the EDA results).
2.  **Step 4: Model Training & Deep Error Analysis** (Focusing on residuals and failure modes).
3.  **Step 5: Final Research Report** (Synthesizing the entire investigation).

---
**HANDOVER COMPLETE.**
