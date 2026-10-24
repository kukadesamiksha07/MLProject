
import pandas as pd
import re
import joblib

from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (
    accuracy_score,
    classification_report,
    confusion_matrix
)

# ==========================================
# JOBSHIELD AI - JOB SCAM DETECTION MODEL
# ==========================================

DATASET_PATH = "fake_job_postings.csv"
MODEL_PATH = "jobshield_model.pkl"

# 1. Load dataset
df = pd.read_csv(DATASET_PATH)

# 2. Check required column
if "fraudulent" not in df.columns:
    raise ValueError(
        "Dataset must contain a 'fraudulent' column."
    )

# 3. Combine useful job-posting text fields
text_columns = [
    "title",
    "company_profile",
    "description",
    "requirements",
    "benefits",
    "location",
    "employment_type",
    "required_experience",
    "required_education",
    "industry",
    "function"
]

available_columns = [
    col for col in text_columns if col in df.columns
]

if not available_columns:
    raise ValueError("No supported text columns found.")

df["job_text"] = df[available_columns].fillna("").astype(str).agg(
    " ".join, axis=1
)

# 4. Clean and prepare data
df = df.dropna(subset=["fraudulent"])
df = df[df["fraudulent"].isin([0, 1])]

df["job_text"] = df["job_text"].str.lower()
df = df.drop_duplicates(subset=["job_text"])

X = df["job_text"]
y = df["fraudulent"].astype(int)

if y.nunique() != 2 or y.value_counts().min() < 2:
    raise ValueError(
        "Dataset needs enough examples of both legitimate "
        "and fraudulent jobs."
    )

# 5. Split training and testing data
X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.20,
    random_state=42,
    stratify=y
)

# 6. Build the ML pipeline
model = Pipeline([
    (
        "tfidf",
        TfidfVectorizer(
            stop_words="english",
            max_features=50000,
            ngram_range=(1, 2),
            sublinear_tf=True
        )
    ),
    (
        "classifier",
        LogisticRegression(
            max_iter=1000,
            class_weight="balanced",
            random_state=42
        )
    )
])

# 7. Train the model
print("Training JobShield AI...")
model.fit(X_train, y_train)

# 8. Evaluate on unseen test data
predictions = model.predict(X_test)

print("\n===== JOBSHIELD AI RESULTS =====")
print(f"Accuracy: {accuracy_score(y_test, predictions):.4f}")

print("\nClassification Report:")
print(classification_report(
    y_test,
    predictions,
    target_names=["Legitimate Job", "Fraudulent Job"],
    zero_division=0
))

print("\nConfusion Matrix:")
print(confusion_matrix(y_test, predictions))

# 9. Save the trained model
joblib.dump(model, MODEL_PATH)

print(f"\nModel saved successfully: {MODEL_PATH}")


# 10. Test with a new job posting
def predict_job(job_description):
    cleaned_text = job_description.lower()

    prediction = int(model.predict([cleaned_text])[0])
    probabilities = model.predict_proba([cleaned_text])[0]

    # Classes are 0 = legitimate, 1 = fraudulent
    fraud_index = list(model.classes_).index(1)
    fraud_probability = float(probabilities[fraud_index])

    result = (
        "Potentially Fraudulent"
        if prediction == 1
        else "Likely Legitimate"
    )

    return {
        "prediction": result,
        "fraud_probability": round(fraud_probability * 100, 2)
    }


if __name__ == "__main__":
    sample_job = """
    Work from home and earn a huge salary immediately.
    Pay a registration fee before receiving your offer letter.
    No interview or experience required.
    """

    print("\n===== SAMPLE PREDICTION =====")
    print(predict_job(sample_job))
