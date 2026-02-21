"""
services/ml/app/main.py

FastAPI ML service (compute plane).
This service should:
- Do CPU-bound data processing and ML inference/training work
- Return pure results (JSON)
- Avoid owning auth/session logic (Next.js is the gateway)

Endpoints:
- GET /health
- POST /profile (multipart file upload: CSV)

Important:
- We keep outputs small and structured.
- Anything "long-running" later will move to an async job system.
"""

from fastapi import FastAPI, UploadFile, File, HTTPException
import pandas as pd

app = FastAPI(title="agustin-ml-hub ML Service", version="0.1.0")


@app.get("/health")
def health():
    """
    Deterministic health check.
    Used by Docker, Next.js gateway, and your own monitoring.
    """
    return {"status": "ok"}


@app.post("/profile")
async def profile_dataset(file: UploadFile = File(...)):
    """
    Simple dataset profiler:
    - Accepts a CSV file upload
    - Computes basic stats needed for a first "Data Profiler" tool

    Returns:
    - shape (rows/cols)
    - columns: name, dtype, missing_count, missing_pct
    - numeric summary (count/mean/std/min/median/max) for numeric cols

    NOTE:
    - This is intentionally bounded. We’re proving the service boundary first.
    - Later: sampling, large-file streaming, column typing improvements, charts, etc.
    """
    if not file.filename.lower().endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only .csv uploads are supported right now.")

    try:
        # Read entire file into memory (OK for early stage).
        # Later we’ll add size limits + sampling to protect memory.
        contents = await file.read()
        df = pd.read_csv(pd.io.common.BytesIO(contents))
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to parse CSV: {str(e)}")

    rows, cols = df.shape

    missing_counts = df.isna().sum()
    missing_pct = (missing_counts / max(rows, 1)) * 100.0

    columns = []
    for col in df.columns:
        columns.append(
            {
                "name": str(col),
                "dtype": str(df[col].dtype),
                "missing_count": int(missing_counts[col]),
                "missing_pct": float(missing_pct[col]),
            }
        )

    # Numeric summary: keep it explicit and JSON-friendly
    numeric_df = df.select_dtypes(include="number")
    numeric_summary = []
    if numeric_df.shape[1] > 0:
        desc = numeric_df.describe(percentiles=[0.5]).transpose()
        # Ensure stable keys
        for col_name, row in desc.iterrows():
            numeric_summary.append(
                {
                    "name": str(col_name),
                    "count": float(row.get("count", 0.0)),
                    "mean": float(row.get("mean", 0.0)) if pd.notna(row.get("mean")) else None,
                    "std": float(row.get("std", 0.0)) if pd.notna(row.get("std")) else None,
                    "min": float(row.get("min", 0.0)) if pd.notna(row.get("min")) else None,
                    "median": float(row.get("50%", 0.0)) if pd.notna(row.get("50%")) else None,
                    "max": float(row.get("max", 0.0)) if pd.notna(row.get("max")) else None,
                }
            )

    return {
        "filename": file.filename,
        "shape": {"rows": int(rows), "cols": int(cols)},
        "columns": columns,
        "numeric_summary": numeric_summary,
    }
