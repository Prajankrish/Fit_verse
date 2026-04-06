from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
from typing import Any, Dict, Tuple

import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder


RNG_SEED = 42

FIT_TYPE_TO_INT = {
    "slim": 0,
    "regular": 1,
    "oversized": 2,
}
INT_TO_FIT_TYPE = {v: k for k, v in FIT_TYPE_TO_INT.items()}

FEATURE_COLUMNS = [
    "chest",
    "waist",
    "hips",
    "height",
    "garment_chest",
    "garment_waist",
    "garment_length",
    "fit_type_encoded",
    "stretch_factor",
    "chest_ratio",
    "waist_ratio",
    "height_ratio",
]

TARGET_WIDTH = "width_fit"
TARGET_LENGTH = "length_fit"
TARGET_OVERALL = "overall_fit"

ACCURACY_LOWER_BOUND = 0.80
ACCURACY_UPPER_BOUND = 0.92


@dataclass(frozen=True)
class ArtifactPaths:
    width_model: Path
    length_model: Path
    overall_model: Path
    width_encoder: Path
    length_encoder: Path
    overall_encoder: Path


def default_artifact_paths(base_dir: Path) -> ArtifactPaths:
    return ArtifactPaths(
        width_model=base_dir / "width_model.pkl",
        length_model=base_dir / "length_model.pkl",
        overall_model=base_dir / "overall_model.pkl",
        width_encoder=base_dir / "width_encoder.pkl",
        length_encoder=base_dir / "length_encoder.pkl",
        overall_encoder=base_dir / "overall_encoder.pkl",
    )


def _random_fit_type(rng: np.random.Generator, n: int) -> np.ndarray:
    return rng.choice(["slim", "regular", "oversized"], size=n, p=[0.25, 0.5, 0.25])


def generate_synthetic_dataset(
    output_csv: Path,
    n_samples: int = 12000,
    seed: int = RNG_SEED,
) -> pd.DataFrame:
    """Generate realistic noisy synthetic fit data with soft labels."""
    rng = np.random.default_rng(seed)

    # Correlated body measurements: taller users tend to be larger.
    height = rng.normal(170.0, 9.0, n_samples)
    height = np.clip(height, 150.0, 195.0)

    size_shift = (height - 170.0) * 0.35
    chest = rng.normal(94.0 + size_shift, 8.2, n_samples) + rng.normal(0.0, 2.2, n_samples)
    waist = (chest * 0.74) + rng.normal(0.0, 4.2, n_samples) + (size_shift * 0.15)
    hips = (chest * 1.06) + rng.normal(0.0, 4.2, n_samples) + (size_shift * 0.10)

    chest = np.clip(chest, 75.0, 130.0)
    waist = np.clip(waist, 58.0, 120.0)
    hips = np.clip(hips, 78.0, 140.0)

    fit_type = _random_fit_type(rng, n_samples)
    stretch_factor = rng.uniform(0.0, 0.3, n_samples)

    fit_ease = np.zeros(n_samples)
    slim_mask = fit_type == "slim"
    regular_mask = fit_type == "regular"
    oversized_mask = fit_type == "oversized"

    fit_ease[slim_mask] = rng.uniform(-5.0, -2.0, slim_mask.sum())
    fit_ease[regular_mask] = rng.uniform(1.0, 5.0, regular_mask.sum())
    fit_ease[oversized_mask] = rng.uniform(5.0, 10.0, oversized_mask.sum())

    # Garment measurements with realistic behavior and Gaussian noise.
    garment_chest = chest + fit_ease + rng.normal(0.0, 2.3, n_samples)
    garment_waist = waist + (fit_ease * 0.9) + rng.normal(0.0, 2.3, n_samples)

    # Length correlated to height with additional style variation.
    base_length = height / rng.uniform(2.05, 2.45, n_samples)
    garment_length = base_length + rng.normal(0.0, 2.6, n_samples)

    garment_chest = np.clip(garment_chest, 78.0, 145.0)
    garment_waist = np.clip(garment_waist, 62.0, 135.0)
    garment_length = np.clip(garment_length, 58.0, 105.0)

    # Margins and derived ratios (used for labels and inference sanity checks).
    chest_margin = garment_chest - chest
    waist_margin = garment_waist - waist
    height_ratio = height / np.maximum(garment_length, 1e-6)

    # Probabilistic width labels.
    effective_margin = chest_margin + (stretch_factor * 5.0)
    width_labels = np.empty(n_samples, dtype=object)

    tight_zone = effective_margin < -6.0
    mid_zone = (effective_margin >= -6.0) & (effective_margin <= 4.0)
    loose_zone = effective_margin > 4.0

    width_labels[tight_zone] = rng.choice(["Tight", "Perfect"], size=tight_zone.sum(), p=[0.88, 0.12])
    width_labels[mid_zone] = rng.choice(["Perfect", "Loose"], size=mid_zone.sum(), p=[0.78, 0.22])
    width_labels[loose_zone] = rng.choice(["Loose", "Perfect"], size=loose_zone.sum(), p=[0.88, 0.12])

    # Probabilistic length labels.
    length_labels = np.empty(n_samples, dtype=object)

    short_zone = height_ratio > 2.2
    perfect_zone = (height_ratio >= 1.8) & (height_ratio <= 2.2)
    long_zone = height_ratio < 1.8

    length_labels[short_zone] = rng.choice(["Short", "Perfect"], size=short_zone.sum(), p=[0.86, 0.14])
    length_labels[perfect_zone] = rng.choice(["Perfect", "Short", "Long"], size=perfect_zone.sum(), p=[0.84, 0.08, 0.08])
    length_labels[long_zone] = rng.choice(["Long", "Perfect"], size=long_zone.sum(), p=[0.86, 0.14])

    # Soft overall labels with realistic stochasticity and stable signal.
    overall_labels = np.empty(n_samples, dtype=object)
    for i in range(n_samples):
        m = effective_margin[i]
        hr = height_ratio[i]

        good_zone = (-4.5 <= m <= 6.5) and (1.78 <= hr <= 2.22)
        poor_zone = (m < -8.0) or (hr > 2.32) or (hr < 1.68)

        if good_zone:
            overall_labels[i] = rng.choice(["Good", "Okay"], p=[0.84, 0.16])
        elif poor_zone:
            overall_labels[i] = rng.choice(["Poor", "Okay"], p=[0.85, 0.15])
        else:
            overall_labels[i] = rng.choice(["Okay", "Good", "Poor"], p=[0.78, 0.14, 0.08])

    fit_type_encoded = np.vectorize(FIT_TYPE_TO_INT.get)(fit_type)
    chest_ratio = chest / np.maximum(garment_chest, 1e-6)
    waist_ratio = waist / np.maximum(garment_waist, 1e-6)

    df = pd.DataFrame(
        {
            "chest": chest,
            "waist": waist,
            "hips": hips,
            "height": height,
            "garment_chest": garment_chest,
            "garment_waist": garment_waist,
            "garment_length": garment_length,
            "fit_type": fit_type,
            "fit_type_encoded": fit_type_encoded,
            "stretch_factor": stretch_factor,
            "chest_ratio": chest_ratio,
            "waist_ratio": waist_ratio,
            "height_ratio": height_ratio,
            "chest_margin": chest_margin,
            "waist_margin": waist_margin,
            "width_fit": width_labels,
            "length_fit": length_labels,
            "overall_fit": overall_labels,
        }
    )

    output_csv.parent.mkdir(parents=True, exist_ok=True)
    df.to_csv(output_csv, index=False)
    return df


def _build_classifier(random_state: int = RNG_SEED):
    try:
        from xgboost import XGBClassifier  # type: ignore

        return XGBClassifier(
            n_estimators=220,
            max_depth=6,
            learning_rate=0.07,
            subsample=0.9,
            colsample_bytree=0.9,
            random_state=random_state,
            eval_metric="mlogloss",
            objective="multi:softprob",
            tree_method="hist",
        )
    except Exception:
        return RandomForestClassifier(
            n_estimators=220,
            max_depth=11,
            min_samples_split=10,
            min_samples_leaf=6,
            random_state=random_state,
            n_jobs=-1,
            class_weight="balanced_subsample",
        )


def load_and_preprocess(
    csv_path: Path,
) -> Tuple[pd.DataFrame, pd.Series, pd.Series, pd.Series, LabelEncoder, LabelEncoder, LabelEncoder]:
    df = pd.read_csv(csv_path)

    x = df[FEATURE_COLUMNS].copy()

    width_encoder = LabelEncoder()
    length_encoder = LabelEncoder()
    overall_encoder = LabelEncoder()

    y_width = pd.Series(width_encoder.fit_transform(df[TARGET_WIDTH]), name=TARGET_WIDTH)
    y_length = pd.Series(length_encoder.fit_transform(df[TARGET_LENGTH]), name=TARGET_LENGTH)
    y_overall = pd.Series(overall_encoder.fit_transform(df[TARGET_OVERALL]), name=TARGET_OVERALL)

    return x, y_width, y_length, y_overall, width_encoder, length_encoder, overall_encoder


def train_single_model(x: pd.DataFrame, y: pd.Series, target_name: str) -> Tuple[Any, float]:
    x_train, x_test, y_train, y_test = train_test_split(
        x,
        y,
        test_size=0.2,
        random_state=RNG_SEED,
        stratify=y,
    )

    model = _build_classifier(RNG_SEED)
    model.fit(x_train, y_train)

    y_pred = model.predict(x_test)
    acc = accuracy_score(y_test, y_pred)

    print(f"\n===== {target_name.upper()} MODEL =====")
    print(f"Accuracy: {acc:.4f}")
    print("Confusion Matrix:")
    print(confusion_matrix(y_test, y_pred))
    print("Classification Report:")
    print(classification_report(y_test, y_pred))

    if acc < ACCURACY_LOWER_BOUND:
        raise RuntimeError(
            f"{target_name} accuracy {acc:.4f} is below lower bound {ACCURACY_LOWER_BOUND:.2f}"
        )

    if acc > ACCURACY_UPPER_BOUND:
        print(
            f"Warning: {target_name} accuracy {acc:.4f} is above target realism ceiling {ACCURACY_UPPER_BOUND:.2f}."
        )

    return model, acc


def train_and_save_models(csv_path: Path, artifact_dir: Path) -> Dict[str, float]:
    x, y_width, y_length, y_overall, width_encoder, length_encoder, overall_encoder = load_and_preprocess(csv_path)

    width_model, width_acc = train_single_model(x, y_width, TARGET_WIDTH)
    length_model, length_acc = train_single_model(x, y_length, TARGET_LENGTH)
    overall_model, overall_acc = train_single_model(x, y_overall, TARGET_OVERALL)

    paths = default_artifact_paths(artifact_dir)

    joblib.dump(width_model, paths.width_model)
    joblib.dump(length_model, paths.length_model)
    joblib.dump(overall_model, paths.overall_model)

    joblib.dump(width_encoder, paths.width_encoder)
    joblib.dump(length_encoder, paths.length_encoder)
    joblib.dump(overall_encoder, paths.overall_encoder)

    return {
        "width_accuracy": round(width_acc, 4),
        "length_accuracy": round(length_acc, 4),
        "overall_accuracy": round(overall_acc, 4),
    }


def _score_from_predictions(
    width_fit: str,
    length_fit: str,
    overall_fit: str,
    chest_margin: float,
    waist_margin: float,
) -> int:
    base = {"Good": 86, "Okay": 70, "Poor": 46}.get(overall_fit, 60)
    width_adj = {"Perfect": 8, "Loose": -4, "Tight": -18}.get(width_fit, 0)
    length_adj = {"Perfect": 5, "Long": -5, "Short": -12}.get(length_fit, 0)

    score = base + width_adj + length_adj

    # Tightness penalized more than looseness.
    if chest_margin < -10:
        score -= 10
    elif chest_margin < -6:
        score -= 6

    if waist_margin < -10:
        score -= 5

    if width_fit == "Loose":
        score = min(score, 85)
    if width_fit == "Tight":
        score = min(score, 60)
    if overall_fit == "Poor":
        score = min(score, 49)

    return int(np.clip(round(score), 0, 100))


def _build_feature_row(user: Dict[str, float], garment: Dict[str, Any]) -> Tuple[pd.DataFrame, Dict[str, float]]:
    chest = float(user["chest"])
    waist = float(user["waist"])
    hips = float(user["hips"])
    height = float(user["height"])

    garment_chest = float(garment["garment_chest"])
    garment_waist = float(garment["garment_waist"])
    garment_length = float(garment["garment_length"])
    fit_type = str(garment.get("fit_type", "regular")).lower()
    stretch_factor = float(garment.get("stretch_factor", 0.1))
    stretch_factor = float(np.clip(stretch_factor, 0.0, 0.3))

    fit_type_encoded = FIT_TYPE_TO_INT.get(fit_type, FIT_TYPE_TO_INT["regular"])

    chest_ratio = chest / max(garment_chest, 1e-6)
    waist_ratio = waist / max(garment_waist, 1e-6)
    height_ratio = height / max(garment_length, 1e-6)

    x = pd.DataFrame(
        [
            {
                "chest": chest,
                "waist": waist,
                "hips": hips,
                "height": height,
                "garment_chest": garment_chest,
                "garment_waist": garment_waist,
                "garment_length": garment_length,
                "fit_type_encoded": fit_type_encoded,
                "stretch_factor": stretch_factor,
                "chest_ratio": chest_ratio,
                "waist_ratio": waist_ratio,
                "height_ratio": height_ratio,
            }
        ],
        columns=FEATURE_COLUMNS,
    )

    derived = {
        "chest_margin": garment_chest - chest,
        "waist_margin": garment_waist - waist,
        "height_ratio": height_ratio,
    }
    return x, derived


def predict_fit_ml(
    user: Dict[str, float],
    garment: Dict[str, Any],
    artifact_dir: str | Path = Path(__file__).resolve().parent,
) -> Dict[str, Any]:
    """Deterministic, production-safe inference function for FastAPI usage."""
    artifact_dir = Path(artifact_dir)
    paths = default_artifact_paths(artifact_dir)

    width_model = joblib.load(paths.width_model)
    length_model = joblib.load(paths.length_model)
    overall_model = joblib.load(paths.overall_model)

    width_encoder = joblib.load(paths.width_encoder)
    length_encoder = joblib.load(paths.length_encoder)
    overall_encoder = joblib.load(paths.overall_encoder)

    x_row, derived = _build_feature_row(user, garment)

    width_idx = int(width_model.predict(x_row)[0])
    length_idx = int(length_model.predict(x_row)[0])
    overall_idx = int(overall_model.predict(x_row)[0])

    width_fit = str(width_encoder.inverse_transform([width_idx])[0])
    length_fit = str(length_encoder.inverse_transform([length_idx])[0])
    overall_fit = str(overall_encoder.inverse_transform([overall_idx])[0])

    width_prob = float(np.max(width_model.predict_proba(x_row), axis=1)[0])
    length_prob = float(np.max(length_model.predict_proba(x_row), axis=1)[0])
    overall_prob = float(np.max(overall_model.predict_proba(x_row), axis=1)[0])

    # Rule-based sanity checks for hard constraints.
    if derived["chest_margin"] < -10:
        width_fit = "Tight"

    if derived["height_ratio"] > 2.45:
        length_fit = "Short"
    elif derived["height_ratio"] < 1.65:
        length_fit = "Long"

    # Stability guard to avoid contradictory outcomes.
    if width_fit == "Tight" and overall_fit == "Good":
        overall_fit = "Poor"
    elif width_fit == "Tight" and overall_fit == "Okay":
        overall_fit = "Poor"
    elif length_fit == "Short" and overall_fit == "Good":
        overall_fit = "Okay"

    score = _score_from_predictions(
        width_fit=width_fit,
        length_fit=length_fit,
        overall_fit=overall_fit,
        chest_margin=derived["chest_margin"],
        waist_margin=derived["waist_margin"],
    )

    confidence = round((width_prob + length_prob + overall_prob) / 3.0, 4)

    explanation = (
        f"Predicted width {width_fit}, length {length_fit}, overall {overall_fit}. "
        f"Margins: chest {derived['chest_margin']:.1f} cm, waist {derived['waist_margin']:.1f} cm."
    )

    return {
        "width_fit": width_fit,
        "length_fit": length_fit,
        "overall_fit": overall_fit,
        "score": score,
        "confidence": confidence,
        "explanation": explanation,
    }


def main() -> None:
    base_dir = Path(__file__).resolve().parent
    dataset_path = base_dir / "synthetic_fit_data.csv"

    df = generate_synthetic_dataset(output_csv=dataset_path, n_samples=12000, seed=RNG_SEED)
    print(f"Generated dataset: {dataset_path}")
    print(f"Shape: {df.shape}")

    metrics = train_and_save_models(csv_path=dataset_path, artifact_dir=base_dir)
    print("\nSaved model metrics:", metrics)

    sample_user = {
        "chest": 101.0,
        "waist": 81.0,
        "hips": 106.0,
        "height": 174.0,
    }
    sample_garment = {
        "garment_chest": 106.0,
        "garment_waist": 86.0,
        "garment_length": 74.0,
        "fit_type": "regular",
        "stretch_factor": 0.12,
    }

    pred = predict_fit_ml(sample_user, sample_garment, artifact_dir=base_dir)
    print("\nSample prediction:")
    print(pred)


if __name__ == "__main__":
    main()
