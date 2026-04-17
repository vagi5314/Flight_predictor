import pandas as pd
import os
import gc

def optimize_data(input_path='data/raw/flights.csv', output_path='data/processed/flights_optimized.parquet'):
    df = pd.read_csv(input_path)
    
    df['is_delayed'] = (df['ARRIVAL_DELAY'] > 15).astype('int8')
    df = df.drop(columns=['ARRIVAL_DELAY'])
    
    df['MONTH'] = df['MONTH'].astype('int8')
    df['DAY_OF_WEEK'] = df['DAY_OF_WEEK'].astype('int8')
    df['SCHEDULED_DEPARTURE'] = df['SCHEDULED_DEPARTURE'].astype('int16')
    df['DISTANCE'] = df['DISTANCE'].astype('int16')
    
    cat_cols = ['AIRLINE', 'ORIGIN_AIRPORT', 'DESTINATION_AIRPORT']
    for col in cat_cols:
        df[col] = df[col].astype('category')
        
    df.to_parquet(output_path, engine='pyarrow', compression='snappy')
    
if __name__ == "__main__":
    os.makedirs('data/processed', exist_ok=True)
    optimize_data()
