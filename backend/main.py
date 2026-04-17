import os
import joblib
import pandas as pd
import glob
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# Global dictionary to store the loaded model
ml_models = {}

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Load the ML model on startup
    model_path = os.path.join(os.path.dirname(__file__), '..', 'model.pkl')
    try:
        ml_models["churn_pipeline"] = joblib.load(model_path)
        print(f"Model loaded successfully from {model_path}")
    except Exception as e:
        print(f"Error loading model: {e}")
        # We don't raise here immediately to allow the app to start (so we can check /health)
        # However, prediction will fail if the model is not loaded.
        ml_models["churn_pipeline"] = None
    
    yield
    # Clean up on shutdown
    ml_models.clear()

app = FastAPI(title="Telco Customer Churn Prediction API", lifespan=lifespan)

# Allow requests from the Next.js frontend (local or Vercel)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 19 features exactly matching the pipeline expectations
class CustomerData(BaseModel):
    tenure: int
    SeniorCitizen: int
    MonthlyCharges: float
    TotalCharges: float
    gender: str
    Partner: str
    Dependents: str
    PhoneService: str
    MultipleLines: str
    InternetService: str
    OnlineSecurity: str
    OnlineBackup: str
    DeviceProtection: str
    TechSupport: str
    StreamingTV: str
    StreamingMovies: str
    Contract: str
    PaperlessBilling: str
    PaymentMethod: str

@app.get("/health")
def read_health():
    return {"status": "Backend is running!"}

@app.get("/models")
def get_models():
    # Scan parent directory for all .pkl files
    model_dir = os.path.join(os.path.dirname(__file__), '..', 'models')
    pkl_files = glob.glob(os.path.join(model_dir, '*.pkl'))
    models = [os.path.basename(f) for f in pkl_files]
    return {"models": models}

@app.post("/predict")
def predict_churn(data: CustomerData, model_name: str = Query("model.pkl", description="Name of the pickle model to load.")):
    pipeline = ml_models.get(model_name)
    if pipeline is None:
        try:
            model_path = os.path.join(os.path.dirname(__file__), '..', 'models', model_name)
            if not os.path.exists(model_path):
                raise FileNotFoundError(f"Model {model_name} does not exist.")
            pipeline = joblib.load(model_path)
            ml_models[model_name] = pipeline
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Machine Learning model failed to load: {e}")
        
    try:
        # Convert incoming JSON data to a Pandas DataFrame
        df = pd.DataFrame([data.model_dump()])
        
        # Predict the class (assuming 1 = Churn, 0 = No Churn)
        prediction = pipeline.predict(df)[0]
        
        # Predict the probabilities to gauge confidence
        probabilities = pipeline.predict_proba(df)[0]
        confidence_score = float(probabilities[prediction] * 100)
        
        # Human readable text
        human_readable = "High Risk" if prediction == 1 else "Low Risk"
        
        return {
            "churn_prediction": int(prediction),
            "human_readable": human_readable,
            "confidence_score": round(confidence_score, 2)
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))