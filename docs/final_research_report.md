# ✈️ Final Research Report: Statistical Drivers of Aviation Delays
**Date**: 2026-04-14
**Project Scope**: Data Science Investigation into Aviation Operational Risk

## 1. Executive Summary
This investigation transitioned from a predictive ML task to a scientific research project to identify the statistical drivers of aviation delays. By applying a Medallion Architecture and rigorous hypothesis testing, we identified that while temporal and carrier-specific factors are statistically significant, the "predictability" of delays remains low, particularly for low-cost carriers.

---

## 2. Research Methodology
### 🏗️ Data Architecture
We implemented a **Medallion Architecture** to handle 5.8M+ records efficiently:
- **Bronze (Raw)**: `flights.csv` (Initial ingestion).
- **Silver (Optimized)**: `flights_optimized.parquet` (Downcasted types, cleaned identifiers).
- **Gold (Research)**: `flights_sampled.parquet` (500k rows via Stratified Sampling to preserve delay ratios).

### 🧪 Hypothesis Testing & EDA
We tested three primary hypotheses to guide feature engineering:
| Hypothesis | Test | Result | P-Value | Conclusion |
| :--- | :--- | :--- | :--- | :--- |
| **H1: Time of Day** | Chi-Square | Validated | < 0.001 | Significant peak in late evening (18:00-22:00) |
| **H2: Airline Choice** | ANOVA | Validated | < 0.001 | Carrier performance varies significantly |
| **H3: Distance** | Pearson | Rejected | 0.067 | Weak predictor of delay magnitude |

---

## 3. Implementation & Feature Engineering
Based on the scientific findings, we developed a specialized feature pipeline:
- **Temporal Periodicity**: Implemented Sine/Cosine encoding for `SCHEDULED_DEPARTURE` to capture the 24-hour cycle.
- **Carrier Risk**: Applied Target Encoding to `AIRLINE` and `ORIGIN_AIRPORT` to transform categories into probability scores.
- **Hub Interaction**: Created interaction terms between Airlines and Airports to isolate specific operational bottlenecks.

---

## 4. Model Performance & Failure Analysis
### 📈 Results
- **Model**: LightGBM Classifier
- **Metric**: PR-AUC $\approx 0.315$
- **Observation**: High accuracy for on-time flights, but very low recall for delays.

### 🚨 Deep Error Analysis (Residuals)
The most critical finding came from analyzing the **False Negatives** (Unexpected Delays):
- **The Low-Cost Carrier Gap**: Carriers like **NK (Spirit)** and **F9 (Frontier)** exhibited the highest "Miss Rates."
- **Finding**: The model consistently underestimates delays for budget airlines. This suggests that low-cost operational models (tighter turns, fewer spare aircraft) introduce a level of volatility that cannot be predicted by schedule alone.

---

## 5. Final Conclusions & Recommendations
1. **Statistically Proven**: Time of day and Airline are the primary structural drivers of delay.
2. **The Predictability Ceiling**: Static schedule data is insufficient for high-precision delay prediction.
3. **Future Research**: To resolve the "Low-Cost Carrier Gap," future models must integrate:
    - **Real-time Weather (METAR/TAF)**.
    - **Aircraft Rotation Data** (Tracking the plane's previous leg).
    - **Crew Duty Constraints**.

**End of Report.**
