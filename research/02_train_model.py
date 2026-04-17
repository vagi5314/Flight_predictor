import pandas as pd
import lightgbm as lgb
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, average_precision_score
import pickle
import os

def train_lgbm():
    df = pd.read_parquet('data/processed/flights_engineered.parquet')

    # Define features: Use engineered features, drop target and raw identifiers if any
    # We keep the encoded versions and cyclic features
    cols_to_drop = ['is_delayed', 'ARRIVAL_DELAY']
    # Drop original categorical columns to avoid duplication with target-encoded versions if they exist
    # But for LGBM, keeping them can sometimes help if specified as categorical.
    # However, to keep it clean and research-focused, let's use our engineered set.

    X = df.drop(columns=[c for c in cols_to_drop if c in df.columns])
    y = df['is_delayed']

    # Identify remaining categorical columns for LGBM
    categorical_features = [col for col in X.columns if 'AIRLINE' in col or 'AIRPORT' in col]

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)

    train_data = lgb.Dataset(X_train, label=y_train, categorical_feature=categorical_features, free_raw_data=False)
    test_data = lgb.Dataset(X_test, label=y_test, reference=train_data, free_raw_data=False)

    params = {
        'objective': 'binary',
        'metric': 'aucpr',
        'boosting_type': 'gbdt',
        'learning_rate': 0.05,
        'num_leaves': 31,
        'max_depth': -1,
        'feature_fraction': 0.8,
        'verbose': -1
    }

    model = lgb.train(
        params,
        train_data,
        num_boost_round=500,
        valid_sets=[test_data],
        valid_names=['eval'],
        callbacks=[lgb.log_evaluation(50)]
    )

    y_pred_prob = model.predict(X_test, num_iteration=model.best_iteration)
    y_pred = (y_pred_prob > 0.5).astype(int)

    print("\n--- Model Performance ---")
    print("PR-AUC Score:", average_precision_score(y_test, y_pred_prob))
    print(classification_report(y_test, y_pred))

    # SAVE PREDICTIONS FOR ERROR ANALYSIS
    results_df = X_test.copy()
    results_df['actual'] = y_test
    results_df['predicted_prob'] = y_pred_prob
    results_df['predicted'] = y_pred
    results_df.to_parquet('data/processed/test_predictions.parquet')
    print("Test predictions saved to data/processed/test_predictions.parquet")

    os.makedirs('app', exist_ok=True)
    model_path = 'app/lgbm_model.pkl'
    with open(model_path, 'wb') as f:
        pickle.dump(model, f)

if __name__ == "__main__":
    train_lgbm()
