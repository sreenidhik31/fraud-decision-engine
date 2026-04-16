from __future__ import annotations

import os
from typing import Any, Dict, List, Tuple

import joblib
import pandas as pd


BASE_DIR = os.path.dirname(os.path.abspath(__file__))
ARTIFACT_PATH = os.path.join(BASE_DIR, "model", "fraud_model.pkl")

# Cache loaded artifact in memory
_ARTIFACT_CACHE: Tuple[Any, float, float, List[str]] | None = None


def load_artifact(path: str = ARTIFACT_PATH) -> Tuple[Any, float, float, List[str]]:
    """
    Load the trained fraud scoring artifact from disk.

    Returns:
        tuple: (model, block_threshold, review_threshold, feature_names)

    Raises:
        FileNotFoundError: if artifact path does not exist.
        ValueError: if artifact is malformed.
    """
    global _ARTIFACT_CACHE

    if _ARTIFACT_CACHE is not None:
        return _ARTIFACT_CACHE

    if not os.path.exists(path):
        raise FileNotFoundError(f"Artifact file not found: {path}")

    artifact = joblib.load(path)

    required_keys = {"model", "block_threshold", "review_threshold", "feature_names"}
    missing_keys = required_keys - set(artifact.keys())
    if missing_keys:
        raise ValueError(f"Artifact missing required keys: {sorted(missing_keys)}")

    model = artifact["model"]
    block_threshold = float(artifact["block_threshold"])
    review_threshold = float(artifact["review_threshold"])
    feature_names = list(artifact["feature_names"])

    if not feature_names:
        raise ValueError("Artifact feature_names is empty")

    if review_threshold >= block_threshold:
        raise ValueError("Invalid artifact thresholds: review_threshold must be less than block_threshold")

    _ARTIFACT_CACHE = (model, block_threshold, review_threshold, feature_names)
    return _ARTIFACT_CACHE


def get_decision(probability: float, block_threshold: float, review_threshold: float) -> str:
    """
    Convert fraud probability into business decision tier.
    """
    if probability >= block_threshold:
        return "BLOCK"
    if probability >= review_threshold:
        return "REVIEW"
    return "ALLOW"


def _prepare_dataframe(records: List[Dict[str, float]], feature_names: List[str]) -> pd.DataFrame:
    """
    Validate and align input records into model-ready DataFrame.
    """
    if not records:
        raise ValueError("Input records cannot be empty")

    df = pd.DataFrame(records)

    incoming_keys = set(df.columns)
    expected_keys = set(feature_names)

    missing_features = sorted(expected_keys - incoming_keys)
    extra_features = sorted(incoming_keys - expected_keys)

    if missing_features or extra_features:
        raise ValueError(
            f"Invalid feature schema | missing_features={missing_features} | extra_features={extra_features}"
        )

    df = df[feature_names]

    # Ensure all values are numeric
    try:
        df = df.astype(float)
    except ValueError as exc:
        raise ValueError(f"All feature values must be numeric: {exc}") from exc

    return df


def score_one(transaction: Dict[str, float]) -> Dict[str, float | str]:
    """
    Score a single transaction and return fraud probability + decision.
    """
    if not transaction:
        raise ValueError("Transaction cannot be empty")

    model, block_threshold, review_threshold, feature_names = load_artifact()
    df = _prepare_dataframe([transaction], feature_names)

    probability = float(model.predict_proba(df)[0][1])
    decision = get_decision(probability, block_threshold, review_threshold)

    return {
        "fraud_probability": probability,
        "decision": decision,
    }


def score_batch(transactions: List[Dict[str, float]]) -> List[Dict[str, float | str]]:
    """
    Score a batch of transactions and return fraud probability + decision for each.
    """
    model, block_threshold, review_threshold, feature_names = load_artifact()
    df = _prepare_dataframe(transactions, feature_names)

    probabilities = model.predict_proba(df)[:, 1]

    return [
        {
            "fraud_probability": float(probability),
            "decision": get_decision(float(probability), block_threshold, review_threshold),
        }
        for probability in probabilities
    ]