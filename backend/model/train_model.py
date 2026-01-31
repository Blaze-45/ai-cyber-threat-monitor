import pandas as pd
import numpy as np
import pickle
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, accuracy_score

# --- CONFIGURATION ---
DATA_FILE = 'traffic_dataset.csv'  # Make sure your CSV is in the same folder
MODEL_PATH = '../model.pkl'   # We save it directly to backend

print("🚀 Starting AI Training Pipeline...")

# 1. LOAD DATA
try:
    df = pd.read_csv(DATA_FILE)
    print(f"✅ Loaded dataset with {len(df)} rows.")
except FileNotFoundError:
    print("❌ Error: 'traffic_dataset.csv' not found. Please move your CSV to this folder.")
    exit()

# 2. PREPROCESSING
# You mentioned IDLE and Null are the same. Let's fill Nulls in 'threat_level' with 'IDLE'
df['threat_level'] = df['threat_level'].fillna('IDLE')

# We only need the numeric columns for training (Inputs)
# Input Features: Requests, Error Rate, Latency
X = df[['requests', 'error_rate', 'latency']]

# Target: Threat Level (What we want to predict)
y = df['threat_level']

# 3. SPLIT DATA
# 80% for Training, 20% for Testing (to see how smart it is)
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# 4. TRAIN MODEL
print("🧠 Training Random Forest Classifier...")
# n_estimators=100 means we use 100 "decision trees" to vote on the answer
model = RandomForestClassifier(n_estimators=100, random_state=42)
model.fit(X_train, y_train)

# 5. EVALUATE
print("📊 Evaluating Model Performance...")
predictions = model.predict(X_test)
accuracy = accuracy_score(y_test, predictions)

print(f"\n🎯 Model Accuracy: {accuracy * 100:.2f}%")
print("\nDetailed Report:")
print(classification_report(y_test, predictions))

# 6. SAVE MODEL
print(f"💾 Saving model to {MODEL_PATH}...")
with open(MODEL_PATH, 'wb') as f:
    pickle.dump(model, f)

print("✅ DONE. The AI is ready for the backend.")