# Fraud Decision Engine

A machine learning project that converts fraud-risk predictions into operational business decisions using a cost-aware 3-tier fraud policy.

## Live Demo

* App: https://fraud-decision-engine.onrender.com/app
* API Docs: https://fraud-decision-engine.onrender.com/docs

---

## Overview

Most fraud-detection projects stop at classification metrics like accuracy or ROC-AUC. This project focuses on what happens after prediction — deciding whether to allow, review, or block a transaction based on business risk and operational cost.

The system applies a 3-tier decision strategy:

| Decision | Purpose                                          |
| -------- | ------------------------------------------------ |
| ALLOW    | Low-risk transactions                            |
| REVIEW   | Medium-risk transactions sent for analyst review |
| BLOCK    | High-risk transactions                           |

Using optimized review and block thresholds, the policy reduced simulated fraud decision cost from approximately **4,800 to 2,996 (~37.6%)** compared to a naive threshold baseline under predefined fraud-loss and operational-cost assumptions.

---

## Key Features

* Real-time fraud scoring with FastAPI
* Batch transaction inference
* Threshold-based policy simulation
* Cost-impact evaluation workflows
* Interactive frontend for fraud-risk testing
* API validation and structured inference pipelines
* CI testing with GitHub Actions
* Public cloud deployment on Render

---

## Tech Stack

**Backend:** FastAPI, Python, Scikit-learn
**Frontend:** HTML, CSS, JavaScript
**Testing & DevOps:** Pytest, Docker, GitHub Actions
**Deployment:** Render

---

## Run Locally

Clone the repository:

```bash
git clone https://github.com/sreenidhik31/fraud-decision-engine.git
cd fraud-decision-engine
```

Create and activate a virtual environment:

```bash
python -m venv .venv
.venv\Scripts\activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Start the FastAPI application:

```bash
uvicorn api:app --reload
```

Open locally:

* App: http://127.0.0.1:8000/app
* API Docs: http://127.0.0.1:8000/docs
* Policy Metadata: http://127.0.0.1:8000/policy

---

## Run Tests

```bash
pytest tests/ -v
```

---

## Run with Docker

Build the container:

```bash
docker build -t fraud-decision-engine .
```

Run the container:

```bash
docker run -p 8000:8000 fraud-decision-engine
```

Open locally:

* App: http://127.0.0.1:8000/app
* API Docs: http://127.0.0.1:8000/docs

---

## Repository Structure

```text
fraud-decision-engine/
├── .github/
│   └── workflows/
├── model/
├── notebooks/
├── static/
├── templates/
├── tests/
├── api.py
├── scoring.py
├── requirements.txt
└── Dockerfile
```

### Directory Notes

* `model/`
  Serialized Scikit-learn model artifacts and threshold metadata.

* `notebooks/`
  Threshold tuning, policy simulation, and offline evaluation workflows.

* `tests/`
  API validation and inference pipeline tests.

* `static/` and `templates/`
  Frontend assets and HTML templates served directly from FastAPI.

---

## API Endpoints

| Method | Endpoint                 | Description                       |
| ------ | ------------------------ | --------------------------------- |
| POST   | `/score`                 | Single transaction scoring        |
| POST   | `/score-batch`           | Batch transaction inference       |
| POST   | `/simulate-policy`       | Threshold-based policy simulation |
| POST   | `/evaluate-policy-batch` | Batch policy evaluation           |
| POST   | `/simulate-cost-impact`  | Compare policy cost impact        |
| GET    | `/policy`                | Governance and policy metadata    |
| GET    | `/metrics`               | API usage metrics                 |
| GET    | `/model-info`            | Model metadata and schema         |
| GET    | `/ready`                 | Readiness check                   |

---

## Highlights

* Designed a cost-sensitive fraud decision workflow instead of a standard binary classifier
* Reduced simulated fraud decision cost by ~37.6% using optimized threshold policies
* Built REST APIs for scoring, simulation, and batch evaluation
* Implemented schema validation, feature alignment, and model caching
* Deployed a live public application with CI testing workflows
* Structured the project using modular inference and policy layers

---

## Future Improvements

* Real-time streaming inference
* Drift monitoring and retraining workflows
* Analyst feedback integration
* Production-grade monitoring and observability
* Feature-store integration
