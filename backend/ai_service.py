from flask import Flask, request, jsonify
import pandas as pd
import pickle
import sys
import os

app = Flask(__name__)

# --- CONFIGURATION ---
# Assumes model.pkl is in the same folder as this script (backend/)
# Change line 11 to:
MODEL_PATH = r'..\backend\model\model.pkl'  
PORT = 5000

print(f"🧠 AI Service starting on Port {PORT}...")

# 1. LOAD MODEL
try:
    with open(MODEL_PATH, 'rb') as f:
        model = pickle.load(f)
    print("✅ Model loaded successfully.")
except FileNotFoundError:
    print(f"❌ ERROR: '{MODEL_PATH}' not found. Did you run train_model.py?")
    sys.exit(1)

# 2. DEFINE ENDPOINT
@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.json
        
        # Prepare input dataframe (must match training columns exactly)
        # Note: Node sends 'errorRate', model expects 'error_rate'
        features = pd.DataFrame([{
            'requests': data['requests'],
            'error_rate': data['errorRate'],
            'latency': data['latency']
        }])
        
        prediction = model.predict(features)[0]
        print(f"🔮 Input: {data['requests']} reqs | AI Verdict: {prediction.upper()}", flush=True) # <--- ADD THIS
        
        # Map raw labels to Dashboard Status
        result = {
            'threatLevel': prediction, # idle, low, moderate, high
            'status': 'active',
            'action': 'Monitor'
        }

        # Logic Mapping (Translating AI Speak to Dashboard Speak)
        if prediction == 'high':
            result['status'] = 'critical'
            result['action'] = 'IP Blocked'
        elif prediction == 'moderate':
            result['status'] = 'warning'
            result['action'] = 'Rate Limiting'
        elif prediction == 'idle':
            result['status'] = 'active'
            result['action'] = 'Standby'
        
        # Force "Low" to be active/monitor
        if prediction == 'low':
             result['status'] = 'active'
             result['action'] = 'Monitor'
            
        return jsonify(result)

    except Exception as e:
        print(f"⚠️ Prediction Error: {str(e)}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(port=PORT, debug=False)