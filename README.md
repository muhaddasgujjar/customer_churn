<div align="center">
  <img src="https://raw.githubusercontent.com/lucide-icons/lucide/main/icons/zap.svg" width="80" alt="ChurnSight Logo">
  <h1>ChurnSight</h1>
  <p>An End-to-End Enterprise Machine Learning Customer Churn Predictor</p>
</div>

---

## 🚀 Overview

**ChurnSight** is a state-of-the-art predictive analytics platform designed to calculate Telco customer churn risks in real-time. Featuring a robust Python/FastAPI machine learning inference backend and a modern Next.js edge-rendered dashboard. 

It dynamically loads multiple custom trained algorithms (Logistic Regression, Random Forest, Gradient Boosting, SVC) and processes inputs through live Scikit-learn pipelines.

## 🏗 Directory Structure

```text
📦 Customer_churn
 ┣ 📂 backend/         # FastAPI web server and API endpoints
 ┣ 📂 frontend/        # Next.js 14 React Application (Tailwind + Lucide)
 ┣ 📂 models/          # Trained Scikit-Learn .pkl Pipelines
 ┣ 📜 train_models.py  # Automation script to train & export models
 ┗ 📜 WA_Fn-UseC_-Telco-Customer-Churn.csv  # Dataset
```

## ✨ Features

- **Multi-Model Support:** The backend dynamically scans the `models/` directory and exposes any trained `.pkl` models to the frontend via an API.
- **Premium Interface:** A dark-mode, glassmorphism UI designed for enterprise. Reduces cognitive load by requiring only 7 essential prediction inputs (the backend handles the remaining 12 via smart defaults).
- **Probability & Confidence Gauges:** Extracts `predict_proba` class percentages directly from the model pipelines and transforms them into intuitive, animated progress elements.

## ⚙️ Quick Start Setup

### 1. Requirements
- Python 3.10+
- Node.js 18+

### 2. Backend Initialization
The backend server handles real-time inferencing. 
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8080
```

### 3. Frontend Initialization
The interactive user dashboard.
```bash
cd frontend
npm install
npm run dev
```
Access the application at: `http://localhost:3000`

## 🧠 Training Custom Models

If you introduce new data or wish to experiment with different hyperparameters, we have provided an automated suite.

```bash
python train_models.py
```

This will parse the core dataset, impute missing values, rebuild the `ColumnTransformer` (scaling and One-Hot encoding), retrain all four core algorithms, and export them safely to the `models/` directory!
