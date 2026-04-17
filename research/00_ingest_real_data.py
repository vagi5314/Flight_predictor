import pandas as pd
import numpy as np
import os
import gc

def ingest_and_profile_data(input_path='data/raw/flights.csv', output_path='data/processed/flights_optimized.parquet'):
    print(f"Starting ingestion from: {input_path}")

    # 1. Load the data
    try:
        # To handle mixed types and large files, we specify dtypes for critical columns upfront
        # This prevents the 'mixed type' warning and ensures consistency
        dtype_mapping = {
            'AIRLINE': str,
            'ORIGIN_AIRPORT': str,
            'DESTINATION_AIRPORT': str,
            'MONTH': str,
            'DAY_OF_WEEK': str
        }
        df = pd.read_csv(input_path, dtype=dtype_mapping)
        print(f"Successfully loaded {len(df):,} records.")
    except Exception as e:
        print(f"Error loading CSV: {e}")
        return

    # 2. Identify and select required columns based on actual headers
    # This makes the script robust to slight variations in the dataset
    required_cols = [
        'MONTH', 'DAY_OF_WEEK', 'AIRLINE', 'ORIGIN_AIRPORT',
        'DESTINATION_AIRPORT', 'SCHEDULED_DEPARTURE', 'DISTANCE', 'ARRIVAL_DELAY'
    ]

    # Check which required columns actually exist in the loaded dataframe
    available_cols = [col for col in required_cols if col in df.columns]
    missing_cols = [col for col in required_cols if col not in df.columns]

    if missing_cols:
        print(f"Warning: Missing columns in dataset: {missing_cols}")
        # We will proceed with what we have, but we need these for our model.

    # Keep only the intersection of required and available columns
    df = df[available_cols]

    # 3. Data Cleaning & Handling "Real-World" Messiness
    print("Cleaning data and handling missing values...")

    # Handle Arrival Delay NaNs (often caused by cancellations)
    # We drop rows where ARRIVAL_DELAY is NaN because we can't predict a delay for a flight that didn't happen.
    if 'ARRIVAL_DELAY' in df.columns:
        initial_len = len(df)
        df = df.dropna(subset=['ARRIVAL_DELAY'])
        dropped_rows = initial_len - len(df)
        if dropped_rows > 0:
            print(f"Dropped {dropped_rows:,} rows with missing Arrival Delay.")

    # SANITIZATION: Ensure airport columns are clean strings (removes accidental numeric noise)
    for col in ['ORIGIN_AIRPORT', 'DESTINATION_AIRPORT', 'AIRLINE']:
        if col in df.columns:
            df[col] = df[col].astype(str).str.strip().str.upper()

    # 4. Feature Engineering (The Target Variable)
    if 'ARRIVAL_DELAY' in df.columns:
        df['is_delayed'] = (df['ARRIVAL_DELAY'] > 15).astype('int8')
    else:
        print("Error: ARRIVAL_DELAY not found. Cannot create target variable 'is_delayed'.")
        return

    # 5. Statistical Profiling (The "Science" part)
    print("Performing statistical profiling...")

    # Basic stats for numerical columns
    num_cols = df.select_dtypes(include=[np.number]).columns.tolist()
    if 'is_delayed' in num_cols: num_cols.remove('is_delayed') # Don't profile the target as a feature

    profiling_stats = {
        "total_records": len(df),
        "numerical_summary": df[num_cols].describe().to_dict() if num_cols else {},
        "skewness": df[num_cols].skew().to_dict() if num_cols else {}
    }

    print("\n--- Statistical Profile Snippet ---")
    if num_cols:
        print(df[num_cols].describe().loc[['mean', 'std', 'min', '50%', 'max']])
    print("-----------------------------------\n")

    # 6. Memory Optimization (Downcasting)
    print("Optimizing memory footprint...")
    for col in df.columns:
        if col in ['MONTH', 'DAY_OF_WEEK', 'SCHEDULED_DEPARTURE', 'DISTANCE']:
            df[col] = pd.to_numeric(df[col], errors='coerce')

        if df[col].dtype == 'int64':
            df[col] = pd.to_numeric(df[col], downcast='integer')
        elif df[col].dtype == 'float64':
            df[col] = pd.to_numeric(df[col], downcast='float')
        elif df[col].dtype == 'object' or df[col].dtype == 'string':
            df[col] = df[col].astype('category')

    # 7. Save to Parquet
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    df.to_parquet(output_path, engine='pyarrow', compression='snappy')
    print(f"Optimized data saved to: {output_path}")

    # Cleanup
    del df
    gc.collect()

if __name__ == "__main__":
    ingest_and_profile_data()
