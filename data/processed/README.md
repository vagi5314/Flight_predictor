# data/processed/ — what lives here

| File | Tracked in git? | Size | Used by |
|---|---|---|---|
| `aggregates.json` | YES | 139 KB | `backend/api.py` lifespan — pre-computed hourly/airline/route stats for fast startup |
| `flights_optimized.parquet` | **NO** (intentionally) | 59 MB | `research/00_sample_data.py`, `backend/diagnose.py` |

## Why `flights_optimized.parquet` is not in git

The parquet is 59 MB. Keeping it in git bloats the repo and slows every clone.
It is also reproducible from `data/raw/` via the ETL pipeline.

## If you cloned this repo and the parquet is missing

That's expected. Two options:

1. **Regenerate it** by running the ETL pipeline that produces `data/processed/flights_optimized.parquet` from `data/raw/`.
2. **Download a release tarball** if your fork has GitHub Releases with data assets attached.

The FastAPI backend (`backend/api.py`) does **not** need this file.
It loads `aggregates.json` (which IS in git) and `app/lgbm_model.pkl` at startup.
Only the research sampling script and the dependency-check script need the parquet.
