"use client";

import React, { useState, useEffect } from "react";
import { 
  Building2, 
  CreditCard, 
  ShieldAlert, 
  AlertTriangle, 
  CheckCircle2, 
  Loader2,
  Activity,
  Zap
} from "lucide-react";

export default function Home() {
  // Only 7 fields will be visible. The others are kept here as default values for the model.
  const [formData, setFormData] = useState({
    // Visible Fields
    tenure: 12,
    MonthlyCharges: 50.0,
    Contract: "Month-to-month",
    InternetService: "Fiber optic",
    PaymentMethod: "Electronic check",
    TechSupport: "No",
    OnlineSecurity: "No",
    
    // Hidden Background Defaults
    TotalCharges: 600.0, // We could dynamically calculate this (tenure * MonthlyCharges) but usually it's passed directly.
    gender: "Female",
    SeniorCitizen: 0,
    Partner: "No",
    Dependents: "No",
    PhoneService: "Yes",
    MultipleLines: "No",
    OnlineBackup: "No",
    DeviceProtection: "No",
    StreamingTV: "No",
    StreamingMovies: "No",
    PaperlessBilling: "Yes"
  });

  const [availableModels, setAvailableModels] = useState<string[]>(['model.pkl']);
  const [selectedModel, setSelectedModel] = useState<string>("model.pkl");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{
    churn_prediction: number;
    human_readable: string;
    confidence_score: number;
  } | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    let parsedValue: any = value;
    if (type === 'number') {
      parsedValue = parseFloat(value) || 0;
    }

    setFormData(prev => {
      const updated = { ...prev, [name]: parsedValue };
      // Auto-calculate TotalCharges as a rough estimate so the model has realistic data
      if (name === 'tenure' || name === 'MonthlyCharges') {
        updated.TotalCharges = updated.tenure * updated.MonthlyCharges;
      }
      return updated;
    });
  };

  useEffect(() => {
    // Fetch available models on load
    fetch("http://localhost:8080/models")
      .then(res => res.json())
      .then(data => {
        if (data.models && data.models.length > 0) {
          setAvailableModels(data.models);
          if (!data.models.includes(selectedModel)) {
            setSelectedModel(data.models[0]);
          }
        }
      })
      .catch(err => console.error("Could not fetch models:", err));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch(`http://localhost:8080/predict?model_name=${encodeURIComponent(selectedModel)}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        // Parse the exact detail from the backend if available
        let backendDetail = "Failed to communicate with prediction API.";
        try {
            const errData = await response.json();
            if (errData.detail) {
                backendDetail = typeof errData.detail === 'string' ? errData.detail : JSON.stringify(errData.detail);
            }
        } catch { }
        throw new Error(backendDetail);
      }

      const data = await response.json();
      setResult(data);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred. Please ensure backend is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-gray-100 font-sans selection:bg-indigo-500/30">
      
      {/* Premium Header */}
      <nav className="border-b border-white/10 bg-white/5 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-2.5 rounded-xl shadow-lg shadow-indigo-500/20">
              <Zap className="text-white w-5 h-5 fill-white/20" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white">Churn<span className="text-indigo-400">Sight</span></h1>
            </div>
          </div>
          <div className="flex items-center space-x-3">
             <span className="text-sm text-gray-400 hidden md:inline-block">Active Model:</span>
             <select 
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="text-xs font-semibold px-3 py-1.5 bg-white/10 rounded-full text-indigo-300 border border-white/5 outline-none focus:ring-2 focus:ring-indigo-500 appearance-none cursor-pointer"
             >
                {availableModels.map(m => (
                  <option key={m} value={m} className="bg-gray-900 text-white">{m}</option>
                ))}
             </select>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-12">
        
        <div className="mb-10 text-center max-w-2xl mx-auto space-y-4">
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-br from-white to-gray-400 bg-clip-text text-transparent pb-1">
            Predict customer churn instantly.
          </h2>
          <p className="text-gray-400 text-lg">
            Our AI analyzes key subscription signals to determine retention likelihood. We've streamlined the input process to just the essential 7 metrics.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column - Form */}
          <div className="lg:col-span-7 flex flex-col space-y-6">
            <form id="churn-form" onSubmit={handleSubmit} className="space-y-6 relative">
              
              {/* Premium Glow Effect Behind Form */}
              <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-[24px] blur opacity-20 pointer-events-none"></div>

              <div className="relative bg-[#111] p-8 rounded-2xl border border-white/10 shadow-2xl">
                
                <div className="mb-6 flex items-center justify-between border-b border-white/10 pb-4">
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <Activity className="w-5 h-5 text-indigo-400" />
                    Essential Predictors
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Tenure */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300 block">Tenure (Months)</label>
                    <input 
                      type="number" name="tenure" value={formData.tenure} onChange={handleChange} min="0" 
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all" 
                      placeholder="e.g. 12"
                    />
                  </div>

                  {/* Monthly Charges */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300 block">Monthly Charges ($)</label>
                    <input 
                      type="number" step="0.01" name="MonthlyCharges" value={formData.MonthlyCharges} onChange={handleChange} min="0" 
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all" 
                    />
                  </div>

                  {/* Contract */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300 block">Contract Type</label>
                    <select 
                      name="Contract" value={formData.Contract} onChange={handleChange} 
                      className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl p-3 text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all appearance-none"
                    >
                      <option value="Month-to-month">Month-to-month</option>
                      <option value="One year">One year</option>
                      <option value="Two year">Two year</option>
                    </select>
                  </div>

                  {/* Internet Service */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300 block">Internet Service</label>
                    <select 
                      name="InternetService" value={formData.InternetService} onChange={handleChange} 
                      className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl p-3 text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all appearance-none"
                    >
                      <option value="DSL">DSL</option>
                      <option value="Fiber optic">Fiber optic</option>
                      <option value="No">No Internet</option>
                    </select>
                  </div>

                  {/* Tech Support */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300 block">Tech Support</label>
                    <select 
                      name="TechSupport" value={formData.TechSupport} onChange={handleChange} 
                      className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl p-3 text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all appearance-none"
                    >
                      <option value="No">No Support</option>
                      <option value="Yes">Has Support</option>
                      <option value="No internet service">N/A (No Internet)</option>
                    </select>
                  </div>

                  {/* Online Security */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300 block">Online Security</label>
                    <select 
                      name="OnlineSecurity" value={formData.OnlineSecurity} onChange={handleChange} 
                      className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl p-3 text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all appearance-none"
                    >
                      <option value="No">None</option>
                      <option value="Yes">Enabled</option>
                      <option value="No internet service">N/A (No Internet)</option>
                    </select>
                  </div>

                  {/* Payment Method */}
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-medium text-gray-300 block">Payment Method</label>
                    <select 
                      name="PaymentMethod" value={formData.PaymentMethod} onChange={handleChange} 
                      className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl p-3 text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all appearance-none"
                    >
                      <option value="Electronic check">Electronic Check</option>
                      <option value="Mailed check">Mailed Check</option>
                      <option value="Bank transfer (automatic)">Bank Transfer (Auto)</option>
                      <option value="Credit card (automatic)">Credit Card (Auto)</option>
                    </select>
                  </div>

                </div>

                <div className="mt-8">
                  <button
                    type="submit"
                    form="churn-form"
                    disabled={loading}
                    className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3.5 px-4 rounded-xl transition-all shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:shadow-[0_0_25px_rgba(79,70,229,0.5)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Analyzing Profile...</span>
                      </>
                    ) : (
                      <span>Run Prediction Engine</span>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* Right Column - Results Panel */}
          <div className="lg:col-span-5 sticky top-28">
            <div className="bg-[#111] p-8 rounded-2xl border border-white/10 shadow-2xl flex flex-col justify-center min-h-[400px] relative overflow-hidden">
              
              {/* Background Glow */}
              <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-500 rounded-full blur-[100px] opacity-20 pointer-events-none"></div>

              {!result && !error && !loading && (
                <div className="text-center text-gray-500 space-y-4 px-4 relative z-10">
                  <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-6 border border-white/5">
                    <ShieldAlert className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-lg">Awaiting Input Data</p>
                  <p className="text-sm">Submit the form to generate a retention risk score.</p>
                </div>
              )}

              {loading && (
                <div className="text-center space-y-4 relative z-10">
                  <Loader2 className="w-12 h-12 animate-spin text-indigo-400 mx-auto" />
                  <p className="text-indigo-300 font-medium animate-pulse">Running ML pipeline...</p>
                </div>
              )}

              {error && !loading && (
                <div className="w-full p-6 bg-red-500/10 border border-red-500/20 rounded-xl text-center space-y-3 relative z-10">
                  <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center mx-auto">
                    <AlertTriangle className="w-6 h-6 text-red-400" />
                  </div>
                  <h3 className="font-semibold text-red-400 text-lg">Diagnostics Failed</h3>
                  <p className="text-sm text-red-300/80">{error}</p>
                </div>
              )}

              {result && !loading && !error && (
                <div className="w-full w-full flex flex-col items-center space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 relative z-10">
                  
                  <div className="relative">
                    <div className={`absolute inset-0 rounded-full blur-xl opacity-50 ${result.churn_prediction === 1 ? 'bg-red-500' : 'bg-emerald-500'}`}></div>
                    <div className={`relative p-5 rounded-full border border-white/10 bg-[#1a1a1a]`}>
                      {result.churn_prediction === 1 ? (
                        <AlertTriangle className="w-10 h-10 text-red-500" />
                      ) : (
                        <CheckCircle2 className="w-10 h-10 text-emerald-400" />
                      )}
                    </div>
                  </div>

                  <div className="text-center space-y-2">
                    <h3 className={`text-3xl font-extrabold ${result.churn_prediction === 1 ? 'text-red-400' : 'text-emerald-400'}`}>
                      {result.human_readable}
                    </h3>
                    <p className="text-gray-400 text-sm">
                      {result.churn_prediction === 1 
                        ? 'Immediate intervention recommended.' 
                        : 'Customer exhibits strong retention signals.'}
                    </p>
                  </div>

                  {/* High-End Confidence Chart */}
                  <div className="w-full bg-[#1a1a1a] p-5 rounded-2xl border border-white/5 shadow-inner">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-sm font-medium text-gray-400">Prediction Certainty</span>
                      <span className="text-lg font-bold text-white">{result.confidence_score}%</span>
                    </div>
                    <div className="w-full bg-black rounded-full h-3 overflow-hidden border border-white/5">
                      <div 
                        className={`h-full rounded-full transition-all duration-1000 ease-out relative overflow-hidden ${result.churn_prediction === 1 ? 'bg-red-500' : 'bg-emerald-500'}`}
                        style={{ width: `${result.confidence_score}%` }}
                      >
                         <div className="absolute inset-0 bg-white/20 w-[50px] animate-[shimmer_2s_infinite] -skew-x-12"></div>
                      </div>
                    </div>
                  </div>

                </div>
              )}

            </div>
          </div>
        </div>

      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes shimmer {
          0% { transform: translateX(-100%) }
          100% { transform: translateX(400%) }
        }
      `}} />
    </div>
  );
}
