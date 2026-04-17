import pandas as pd
import numpy as np
from sklearn.preprocessing import LabelEncoder
import os

def engineer_features(input_path, output_path):
    print(f"Loading data from {input_path}...")
    df = pd.read_parquet(input_path)

    # 1. Define Target: is_delayed (Delay > 15 mins)
    # Assuming the column name is ARRIVAL_DELAY based on typical BTS datasets
    # If the column name differs, we will adjust after the first run.
    target_col = 'ARRIVAL_DELAY'
    if target_col in df.columns:
        df['is_delayed'] = (df[target_col] > 15).astype(int)
        print("Target 'is_delayed' created.")
    else:
        # Fallback: look for any column containing 'DELAY'
        delay_cols = [c for c in df.columns if 'DELAY' in c]
        if delay_cols:
            target_col = delay_cols[0]
            df['is_delayed'] = (df[target_col] > 15).astype(int)
            print(f"Target 'is_delayed' created using {target_col}.")
        else:
            raise KeyError("No delay column found in dataset to create target.")

    # 2. Feature A: Cyclic encoding of SCHEDULED_DEPARTURE
    # Format usually HHMM (e.g., 1830 for 6:30 PM)
    if 'SCHEDULED_DEPARTURE' in df.columns:
        # Extract hour from HHMM
        # Convert to string, pad with 0, take first two chars
        hours = df['SCHEDULED_DEPARTURE'].astype(str).str.zfill(4).str[:2].astype(int)

        df['dep_hour_sin'] = np.sin(2 * np.pi * hours / 24)
        df['dep_hour_cos'] = np.cos(2 * np.pi * hours / 24)
        print("Cyclic temporal features (sin/cos) created.")

    # 3. Feature B: Target Encoding for AIRLINE and ORIGIN_AIRPORT
    # Target encoding: replaces category with the mean of the target for that category
    categorical_cols = ['AIRLINE', 'ORIGIN_AIRPORT']
    for col in categorical_cols:
        if col in df.columns:
            # Calculate mean of target for each category
            target_means = df.groupby(col)['is_delayed'].mean()
            df[f'{col}_target_enc'] = df[col].map(target_means)
            print(f"Target encoding completed for {col}.")

    # 4. Feature C: Regional hub interaction terms (Airline x Airport)
    if 'AIRLINE' in df.columns and 'ORIGIN_AIRPORT' in df.columns:
        # Create a combined string key
        df['airline_airport_inter'] = df['AIRLINE'].astype(str) + "_" + df['ORIGIN_AIRPORT'].astype(str)
        # Target encode the interaction
        inter_means = df.groupby('airline_airport_inter')['is_delayed'].mean()
        df['airline_airport_inter_enc'] = df['airline_airport_inter'].map(inter_means)
        # Drop the string key to save space
        df = df.drop(columns=['airline_airport_inter'])
        print("Airline x Airport interaction features created.")

    # Save the result
    print(f"Saving engineered dataset to {output_path}...")
    df.to_parquet(output_path, index=False)
    print("Feature engineering complete.")

if __name__ == "__main__":
    INPUT_FILE = "data/processed/flights_sampled.parquet"
    OUTPUT_FILE = "data/processed/flights_engineered.parquet"

    if os.path.exists(INPUT_FILE):
        engineer_features(INPUT_FILE, OUTPUT_FILE)
    else:
        print(f"Error: Input file {INPUT_FILE} not found.")
