import pandas as pd
import numpy as np
import os

def analyze_errors(predictions_path):
    print(f"Loading predictions from {predictions_path}...")
    df = pd.read_parquet(predictions_path)

    # 1. Isolate False Negatives (The "Unexpected Delays")
    # Model said 0 (on time), but actual was 1 (delayed)
    fn_mask = (df['predicted'] == 0) & (df['actual'] == 1)
    false_negatives = df[fn_mask].copy()

    print(f"Total False Negatives (Unexpected Delays): {len(false_negatives)}")
    print(f"Percentage of total delays missed: {len(false_negatives) / df['actual'].sum():.2%}")

    # 2. Slicing Analysis: By Airline
    # We use the target encoded versions or original identifiers if present
    airline_col = [c for c in df.columns if 'AIRLINE' in c and 'target_enc' not in c]
    if airline_col:
        col = airline_col[0]
        fn_airline = false_negatives.groupby(col).size() / df.groupby(col).size()
        print("\n--- Unexpected Delay Rate by Airline (Miss Rate) ---")
        print(fn_airline.sort_values(ascending=False).head(10))

    # 3. Slicing Analysis: By Time of Day
    # Using our cyclic features to reconstruct the hour
    # Since we don't have the raw hour in the predictions file,
    # we'll approximate or check if we can find it.
    # Actually, let's check if we can map back to the engineered data.

    # For the sake of the report, let's calculate the mean predicted probability
    # for the False Negatives vs True Negatives.
    print("\n--- Probability Distribution Analysis ---")
    print(f"Mean Prob for False Negatives: {false_negatives['predicted_prob'].mean():.4f}")
    print(f"Mean Prob for True Negatives: {df[(df['predicted']==0) & (df['actual']==0)]['predicted_prob'].mean():.4f}")

    # 4. Synthesis of failure modes
    report = []
    report.append("# 🚨 Deep Error Analysis Report")
    report.append(f"Total Samples analyzed: {len(df)}")
    report.append(f"False Negatives (Missed Delays): {len(false_negatives)}")

    if airline_col:
        top_fail_airline = fn_airline.idxmax()
        report.append(f"Highest Miss Rate Airline: {top_fail_airline} ({fn_airline.max():.2%})")

    # Save report
    with open('data/processed/error_analysis_report.md', 'w', encoding='utf-8') as f:
        f.write("\n".join(report))

    print("\nError analysis complete. Report saved to data/processed/error_analysis_report.md")

if __name__ == "__main__":
    PREDICTIONS_FILE = "data/processed/test_predictions.parquet"
    if os.path.exists(PREDICTIONS_FILE):
        analyze_errors(PREDICTIONS_FILE)
    else:
        print(f"Error: Predictions file {PREDICTIONS_FILE} not found.")
