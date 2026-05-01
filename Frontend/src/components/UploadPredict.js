import React, { useState, useRef } from "react";
import axios from "axios";
import { 
  CloudUpload, FileImage, AlertCircle, CheckCircle, 
  Activity, Battery, Heart, Loader2, Upload, X,
  Scan, Microscope, Shield, TrendingUp
} from "lucide-react";

export default function UploadPredict() {
  const fileRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [preview, setPreview] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [fileName, setFileName] = useState("");

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFile(files[0]);
    }
  };

  const handleFileSelect = (e) => {
    const files = e.target.files;
    if (files && files[0]) {
      handleFile(files[0]);
    }
  };

  const handleFile = (file) => {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file (JPEG, PNG, GIF)');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB');
      return;
    }

    setFileName(file.name);
    setError(null);
    setResult(null);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setResult(null);

    const files = fileRef.current.files;
    if (!files || files.length === 0) {
      setError("Please choose a file first.");
      return;
    }

    const file = files[0];
    const form = new FormData();
    form.append("file", file);

    try {
      setUploading(true);
      const resp = await axios.post("http://localhost:5000/predict", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setResult(resp.data);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setUploading(false);
    }
  };

  const clearUpload = () => {
    setPreview(null);
    setFileName("");
    setResult(null);
    setError(null);
    if (fileRef.current) {
      fileRef.current.value = "";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-full px-4 py-2 mb-4 shadow-sm">
            <Microscope className="w-4 h-4 text-blue-600" />
            <span className="text-sm text-gray-600">AI-Powered Diagnosis</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent mb-3">
            Pneumonia Detection
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Upload a chest X-ray image for AI-powered pneumonia detection with high accuracy
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Feature Banner */}
          <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 px-6 py-4">
            <div className="flex flex-wrap justify-center gap-6 text-white">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4" />
                <span className="text-sm">99% Accuracy</span>
              </div>
              <div className="flex items-center gap-2">
                <Battery className="w-4 h-4" />
                <span className="text-sm">Real-time Results</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4" />
                <span className="text-sm">Secure & Private</span>
              </div>
            </div>
          </div>

          <div className="p-8">
            <form onSubmit={handleSubmit}>
              {/* Upload Area */}
              <div 
                className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300 cursor-pointer
                  ${dragActive 
                    ? "border-blue-500 bg-blue-50 scale-[1.02]" 
                    : "border-gray-300 hover:border-blue-400 hover:bg-gray-50"
                  }
                  ${preview ? "bg-gray-50" : ""}
                `}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileRef.current?.click()}
              >
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                
                {!preview ? (
                  <div className="space-y-4">
                    <div className="flex justify-center">
                      <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center">
                        <CloudUpload className="w-10 h-10 text-blue-600" />
                      </div>
                    </div>
                    <div>
                      <p className="text-lg font-semibold text-gray-700">
                        Drag & drop your X-ray image here
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        or click to browse files
                      </p>
                    </div>
                    <div className="flex justify-center gap-4 text-xs text-gray-400">
                      <span>JPEG, PNG, GIF</span>
                      <span>Max 10MB</span>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Preview Image */}
                    <div className="relative inline-block">
                      <img 
                        src={preview} 
                        alt="Preview" 
                        className="max-h-64 rounded-xl shadow-lg mx-auto"
                      />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          clearUpload();
                        }}
                        className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition shadow-lg"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">
                        Selected: <span className="font-medium">{fileName}</span>
                      </p>
                      <p className="text-xs text-green-600 mt-1">
                        ✓ Ready for analysis
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <div className="mt-6">
                <button
                  type="submit"
                  disabled={uploading || !preview}
                  className={`w-full py-4 rounded-xl font-semibold text-white transition-all duration-300 flex items-center justify-center gap-2
                    ${uploading || !preview
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 hover:shadow-lg hover:scale-[1.02]"
                    }
                  `}
                >
                  {uploading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Analyzing X-ray...</span>
                    </>
                  ) : (
                    <>
                      <Scan className="w-5 h-5" />
                      <span>Upload & Predict</span>
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Error Message */}
            {error && (
              <div className="mt-6 bg-red-50 rounded-xl p-4 border border-red-200 animate-in slide-in-from-top-2 duration-200">
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                  <div>
                    <p className="text-red-700 font-medium">Upload Failed</p>
                    <p className="text-red-600 text-sm">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Result Section */}
            {result && (
              <div className="mt-6 animate-in fade-in zoom-in duration-300">
                <div className={`rounded-xl overflow-hidden border-2 ${
                  result.prediction === "Pneumonia" 
                    ? "border-red-200 shadow-lg shadow-red-100" 
                    : "border-green-200 shadow-lg shadow-green-100"
                }`}>
                  {/* Result Header */}
                  <div className={`p-4 ${
                    result.prediction === "Pneumonia" 
                      ? "bg-gradient-to-r from-red-50 to-rose-50" 
                      : "bg-gradient-to-r from-green-50 to-emerald-50"
                  }`}>
                    <div className="flex items-center gap-3">
                      {result.prediction === "Pneumonia" ? (
                        <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center">
                          <AlertCircle className="w-6 h-6 text-white" />
                        </div>
                      ) : (
                        <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                          <CheckCircle className="w-6 h-6 text-white" />
                        </div>
                      )}
                      <div>
                        <p className="text-sm text-gray-500">Analysis Result</p>
                        <h3 className={`text-xl font-bold ${
                          result.prediction === "Pneumonia" ? "text-red-700" : "text-green-700"
                        }`}>
                          {result.prediction === "Pneumonia" 
                            ? "🩺 Pneumonia Detected" 
                            : "✅ Normal - No Pneumonia Detected"}
                        </h3>
                      </div>
                    </div>
                  </div>

                  {/* Result Body */}
                  <div className="p-4 bg-white">
                    <div className="space-y-3">
                      {/* Confidence Meter */}
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-600">Confidence Score</span>
                          <span className={`font-bold ${
                            result.prediction === "Pneumonia" ? "text-red-600" : "text-green-600"
                          }`}>
                            {(result.confidence * 100).toFixed(1)}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-1000 ${
                              result.prediction === "Pneumonia" 
                                ? "bg-gradient-to-r from-red-500 to-rose-500" 
                                : "bg-gradient-to-r from-green-500 to-emerald-500"
                            }`}
                            style={{ width: `${result.confidence * 100}%` }}
                          />
                        </div>
                      </div>

                      {/* Additional Info */}
                      <div className="flex items-center gap-4 pt-2 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <TrendingUp className="w-3 h-3" />
                          <span>AI Model: Deep Learning</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Activity className="w-3 h-3" />
                          <span>Real-time Analysis</span>
                        </div>
                      </div>
                    </div>

                    {/* Recommendation */}
                    <div className={`mt-4 p-3 rounded-lg ${
                      result.prediction === "Pneumonia" 
                        ? "bg-red-50 border border-red-200" 
                        : "bg-green-50 border border-green-200"
                    }`}>
                      <p className={`text-sm ${
                        result.prediction === "Pneumonia" ? "text-red-700" : "text-green-700"
                      }`}>
                        {result.prediction === "Pneumonia" 
                          ? "⚠️ Please consult a healthcare professional immediately for proper diagnosis and treatment." 
                          : "✓ Your X-ray appears normal. Continue maintaining good health practices."}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Info Section */}
            <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <Heart className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-blue-800">Medical Disclaimer</p>
                  <p className="text-xs text-blue-600 mt-1">
                    This AI tool is for screening purposes only and should not replace professional medical advice. 
                    Always consult with a qualified healthcare provider for accurate diagnosis.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* How It Works Section */}
        <div className="mt-8 grid md:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl p-4 text-center shadow-md">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Upload className="w-5 h-5 text-blue-600" />
            </div>
            <h4 className="font-semibold text-gray-800">1. Upload</h4>
            <p className="text-xs text-gray-500 mt-1">Upload chest X-ray image</p>
          </div>
          <div className="bg-white rounded-xl p-4 text-center shadow-md">
            <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Scan className="w-5 h-5 text-indigo-600" />
            </div>
            <h4 className="font-semibold text-gray-800">2. Analyze</h4>
            <p className="text-xs text-gray-500 mt-1">AI analyzes the image</p>
          </div>
          <div className="bg-white rounded-xl p-4 text-center shadow-md">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Activity className="w-5 h-5 text-purple-600" />
            </div>
            <h4 className="font-semibold text-gray-800">3. Results</h4>
            <p className="text-xs text-gray-500 mt-1">Get instant prediction</p>
          </div>
        </div>
      </div>
    </div>
  );
}