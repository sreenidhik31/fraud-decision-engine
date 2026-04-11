# 🚨 Fraud Risk Scoring System

A **cost-aware fraud detection system** that scores transactions and routes them into **ALLOW / REVIEW / BLOCK** decisions using calibrated thresholds — exposed via a **FastAPI backend** and an interactive **Streamlit dashboard**.

---

## ⚡ Why This Project Matters

Most ML fraud projects stop at **prediction**.

Real systems require **decisions under cost constraints**:
- ❌ Missed fraud → financial loss  
- ❌ False positives → customer friction  
- ❌ Manual reviews → operational cost  

This system focuses on **decision optimization**, not just accuracy.

---

## 🧠 Key Capabilities

- ✅ Single transaction scoring (`/score`)
- ✅ Batch scoring for real-world pipelines (`/score-batch`)
- ✅ Strict input validation (feature-level enforcement)
- ✅ Threshold-based decision system:
  - **ALLOW**
  - **REVIEW**
  - **BLOCK**
- ✅ Model served via **FastAPI**
- ✅ Interactive UI via **Streamlit**
- ✅ Production-style API design (health, readiness, metadata endpoints)

---

## ⚙️ Decision Logic

Instead of raw predictions, transactions are routed using thresholds:

| Fraud Probability | Decision |
|------------------|---------|
| ≥ 0.9796         | BLOCK   |
| 0.90 – 0.9796    | REVIEW  |
| < 0.90           | ALLOW   |

This simulates **real financial risk control systems**.

---

## 🏗️ System Architecture

    Input (Transaction Data)
            ↓
    Feature Validation
            ↓
    ML Model Scoring
            ↓
    Threshold Engine
            ↓
ALLOW / REVIEW / BLOCK
            ↓
API Response / Dashboard

---

## 📦 Project Structure
├── api.py # FastAPI backend (production-style endpoints)
├── scoring.py # Core scoring + threshold logic
├── app.py # Streamlit frontend (interactive dashboard)
├── model/ # Trained model artifacts
├── notebooks/ # EDA + model development
├── requirements.txt
└── README.md


---

## 🚀 API Endpoints

### Core
- `POST /score` → Score single transaction  
- `POST /score-batch` → Score multiple transactions  

### System
- `GET /` → API metadata  
- `GET /health` → Health check  
- `GET /ready` → Model readiness  
- `GET /features` → Expected feature schema  

---

## 🧪 Example Request

### Single Transaction
```json
{
  "data": {
    "Time": 10000,
    "V1": 0.1,
    ...
    "Amount": 120.5
  }
}

Batch Request

{
  "transactions": [
    { "Time": 10000, "V1": 0.1, ..., "Amount": 120.5 }
  ]
}

🛡️ Validation Layer

The API enforces:

exact feature count (30 features)
correct schema
structured error handling (400 Bad Request)

This ensures robust real-world integration readiness.

📊 Sample Output
{
  "results": [
    {
      "fraud_probability": 0.116,
      "decision": "ALLOW"
    }
  ],
  "count": 1
}

🧩 Tech Stack
Python
FastAPI
Streamlit
Scikit-learn
Pandas / NumPy

⚡ How to Run

pip install -r requirements.txt
uvicorn api:app --reload
streamlit run app.py
