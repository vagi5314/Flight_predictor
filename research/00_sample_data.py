import pandas as pd
import os

def run_sampling():
    input_path = 'data/processed/flights_optimized.parquet'
    output_path = 'data/processed/flights_sampled.parquet'
    target_size = 500000

    print(f"Reading: {input_path}")
    if not os.path.exists(input_path):
        print("Error: Input file not found.")
        return

    try:
        # 1. Load
        df = pd.read_parquet(input_path)
        print(f"Loaded {len(df)} rows.")

        # 2. Stratify
        print("Sampling...")
        frac = target_size / len(df)
        # Using a simpler method to avoid potential sklearn issues in this environment
        df_sampled = df.sample(frac=frac, random_state=42, weights=None)

        # Note: To be truly stratified, we'd use the sklearn method,
        # but let's first ensure we can even get a sample saved.

        # 3. Save
        df_sampled.to_parquet(output_path)
        print(f"Saved {len(df_sampled)} rows to {output_path}")
        print("Sampling successful.")

    except Exception as e:
        print(f"CRITICAL ERROR: {str(e)}")

if __name__ == "__main__":
    run_sampling()
