import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.svm import SVC
import joblib

print("Loading dataset...")
df = pd.read_csv('WA_Fn-UseC_-Telco-Customer-Churn.csv')

# Drop customer ID as it is not used directly for prediction
df.drop('customerID', axis=1, inplace=True)

print("Preprocessing data...")
df['TotalCharges'] = pd.to_numeric(df['TotalCharges'], errors='coerce')
df['TotalCharges'] = df['TotalCharges'].fillna(0)

# Define X and y
X = df.drop('Churn', axis=1)
y = df['Churn'].map({'Yes': 1, 'No': 0})

# Split the data
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Define feature groups for transformation
numeric_features = ['tenure', 'MonthlyCharges', 'TotalCharges']
# Note: SeniorCitizen is already an int (0/1), we can just pass it through or treat as numeric
# Categorical string features
categorical_features = ['gender', 'Partner', 'Dependents', 'PhoneService', 'MultipleLines',
                        'InternetService', 'OnlineSecurity', 'OnlineBackup', 'DeviceProtection',
                        'TechSupport', 'StreamingTV', 'StreamingMovies', 'Contract', 
                        'PaperlessBilling', 'PaymentMethod']

# Create the preprocessing column transformer
preprocessor = ColumnTransformer(
    transformers=[
        ('num', StandardScaler(), numeric_features),
        ('cat', OneHotEncoder(drop='first', handle_unknown='ignore'), categorical_features)
    ],
    remainder='passthrough' # Passes SeniorCitizen through directly
)

# Define the models we want to train
models = {
    'logistic_regression.pkl': LogisticRegression(max_iter=1000, random_state=42),
    'random_forest.pkl': RandomForestClassifier(n_estimators=100, random_state=42),
    'gradient_boosting.pkl': GradientBoostingClassifier(n_estimators=100, random_state=42),
    'svc.pkl': SVC(probability=True, random_state=42) # MUST have probability=True for predict_proba
}

for filename, model in models.items():
    print(f"Training {filename}...")
    pipeline = Pipeline(steps=[
        ('preprocessor', preprocessor),
        ('classifier', model)
    ])
    
    # Train the pipeline
    pipeline.fit(X_train, y_train)
    
    import os
    model_path = os.path.join('models', filename)
    joblib.dump(pipeline, model_path)
    
    score = pipeline.score(X_test, y_test)
    print(f"-> Saved {model_path}. Test Accuracy: {score:.4f}")

print("All models successfully trained and exported!")
