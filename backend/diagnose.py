import sys
import os

# Force UTF-8 output for Windows terminals
if sys.stdout.encoding != 'utf-8':
    sys.stdout.reconfigure(encoding='utf-8')

print("--- Dependency Check ---")
try:
    import pandas as pd
    print(f"OK pandas: {pd.__version__}")
except ImportError as e:
    print(f"FAIL pandas: {e}")

try:
    import numpy as np
    print(f"OK numpy: {np.__version__}")
except ImportError as e:
    print(f"FAIL numpy: {e}")

try:
    import lightgbm as lgb
    print(f"OK lightgbm: {lgb.__version__}")
except ImportError as e:
    print(f"FAIL lightgbm: {e}")

try:
    import shap
    print(f"OK shap: {shap.__version__}")
except ImportError as e:
    print(f"FAIL shap: {e}")

print("\n--- Asset Check ---")
base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
model_path = os.path.join(base_dir, 'app', 'lgbm_model.pkl')
parquet_path = os.path.join(base_dir, 'data', 'processed', 'flights_optimized.parquet')

print(f"Model Path: {model_path} -> {'Found' if os.path.exists(model_path) else 'Missing'}")
print(f"Data Path: {parquet_path} -> {'Found' if os.path.exists(parquet_path) else 'Missing'}")

print("\n--- Model Load Test ---")
try:
    import pickle
    with open(model_path, 'rb') as f:
        model = pickle.load(f)
        print("OK Model loaded successfully via pickle")
except Exception as e:
    print(f"FAIL Model Load Error: {e}")

try:
    import shap
    explainer = shap.TreeExplainer(model)
    print("OK SHAP Explainer initialized successfully")
except Exception as e:
    print(f"FAIL SHAP Error: {e}")
