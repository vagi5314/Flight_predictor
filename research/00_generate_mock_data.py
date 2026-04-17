import pandas as pd
import numpy as np
import os

def generate_flight_data(num_records=100000):
    np.random.seed(42)
    
    airlines = ['AA', 'DL', 'UA', 'WN', 'B6', 'AS', 'NK']
    airports = ['ATL', 'DFW', 'DEN', 'ORD', 'LAX', 'JFK', 'SFO', 'LAS', 'MCO', 'EWR', 
                'CLT', 'PHX', 'IAH', 'MIA', 'BOS', 'MSP', 'DTW', 'FLL', 'PHL', 'LGA']

    data = {
        'MONTH': np.random.randint(1, 13, num_records),
        'DAY_OF_WEEK': np.random.randint(1, 8, num_records),
        'AIRLINE': np.random.choice(airlines, num_records),
        'ORIGIN_AIRPORT': np.random.choice(airports, num_records),
        'DESTINATION_AIRPORT': np.random.choice(airports, num_records),
        'SCHEDULED_DEPARTURE': np.random.randint(500, 2300, num_records), 
        'DISTANCE': np.random.randint(200, 2500, num_records)
    }
    
    df = pd.DataFrame(data)
    
    base_delay = np.random.normal(loc=0, scale=15, size=num_records)
    
    winter_mask = df['MONTH'].isin([12, 1, 2])
    base_delay[winter_mask] += np.random.normal(10, 5, size=winter_mask.sum())
    
    evening_mask = df['SCHEDULED_DEPARTURE'] > 1800
    base_delay[evening_mask] += np.random.normal(15, 10, size=evening_mask.sum())
    
    airline_mask = df['AIRLINE'].isin(['NK', 'B6'])
    base_delay[airline_mask] += np.random.normal(8, 5, size=airline_mask.sum())

    df['ARRIVAL_DELAY'] = base_delay.round()
    
    same_airport_mask = df['ORIGIN_AIRPORT'] == df['DESTINATION_AIRPORT']
    df.loc[same_airport_mask, 'DESTINATION_AIRPORT'] = 'SEA'
    
    os.makedirs('data/raw', exist_ok=True)
    out_path = os.path.join('data/raw', 'flights.csv')
    df.to_csv(out_path, index=False)
    
if __name__ == "__main__":
    generate_flight_data(150000)
