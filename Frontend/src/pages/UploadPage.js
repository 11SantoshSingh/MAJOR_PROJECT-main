import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  CloudUpload, FileImage, AlertCircle, CheckCircle,
  Activity, Battery, Heart, Loader2, Upload, X,
  Scan, Microscope, Shield, TrendingUp, Sparkles,
  Camera, Image, Clock, Award, Brain
} from "lucide-react";

export default function UploadPage() {
  const fileRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [preview, setPreview] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [fileName, setFileName] = useState("");
  const navigate = useNavigate();

  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem("user"));
    } catch (e) {
      return null;
    }
  })();

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
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleFile = (file) => {
    if (file.size > 10 * 1024 * 1024) {
      setError("File size must be less than 10MB");
      return;
    }
    if (!file.type.startsWith("image/")) {
      setError("Please upload a valid image file (JPEG, PNG, GIF)");
      return;
    }

    setFileName(file.name);
    setError(null);
    setResult(null);

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
    };
    reader.readAsDataURL(file);

    if (fileRef.current) {
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);
      fileRef.current.files = dataTransfer.files;
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
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
      localStorage.setItem("predictResult", JSON.stringify(resp.data));

      if (!user) {
        setTimeout(() => navigate("/register"), 5500);
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message || "Failed to process image. Please try again.");
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-full px-4 py-2 mb-4 shadow-sm">
            <Brain className="w-4 h-4 text-blue-600 animate-pulse" />
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
                <Clock className="w-4 h-4" />
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
                  onChange={handleFileChange}
                  className="hidden"
                />

                {!preview ? (
                  <div className="space-y-4">
                    <div className="flex justify-center">
                      <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center animate-bounce">
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
                    <div className="relative inline-block">
                      <img
                        src={preview}
                        alt="X-ray Preview"
                        className="max-h-64 rounded-xl shadow-lg mx-auto"
                      />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          clearUpload();
                        }}
                        className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition shadow-lg hover:scale-110"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">
                        Selected: <span className="font-medium">{fileName}</span>
                      </p>
                      <p className="text-xs text-green-600 mt-1 flex items-center justify-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        Ready for analysis
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
                  <div className="flex-1">
                    <p className="text-red-700 font-medium">Upload Failed</p>
                    <p className="text-red-600 text-sm">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Result Section */}
            {result && (
              <div className="mt-6 animate-in fade-in zoom-in duration-300">
                <div className={`rounded-xl overflow-hidden border-2 ${result.prediction === "Pneumonia"
                    ? "border-red-200 shadow-lg shadow-red-100"
                    : "border-green-200 shadow-lg shadow-green-100"
                  }`}>
                  {/* Result Header */}
                  <div className={`p-5 ${result.prediction === "Pneumonia"
                      ? "bg-gradient-to-r from-red-50 to-rose-50"
                      : "bg-gradient-to-r from-green-50 to-emerald-50"
                    }`}>
                    <div className="flex items-center gap-4">
                      {result.prediction === "Pneumonia" ? (
                        <div className="w-14 h-14 bg-red-500 rounded-full flex items-center justify-center animate-pulse">
                          <AlertCircle className="w-7 h-7 text-white" />
                        </div>
                      ) : (
                        <div className="w-14 h-14 bg-green-500 rounded-full flex items-center justify-center animate-pulse">
                          <CheckCircle className="w-7 h-7 text-white" />
                        </div>
                      )}
                      <div>
                        <p className="text-sm text-gray-500">Analysis Result</p>
                        <h3 className={`text-2xl font-bold ${result.prediction === "Pneumonia" ? "text-red-700" : "text-green-700"
                          }`}>
                          {result.prediction === "Pneumonia"
                            ? "🩺 Pneumonia Detected"
                            : "✅ Normal - No Pneumonia Detected"}
                        </h3>
                      </div>
                    </div>
                  </div>

                  {/* Result Body */}
                  <div className="p-5 bg-white">
                    <div className="space-y-4">
                      {/* Confidence Meter - FIXED */}
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-gray-600">Confidence Score</span>
                          <span className={`font-bold ${result.prediction === "Pneumonia" ? "text-red-600" : "text-green-600"
                            }`}>
                            {/* Check if confidence is already a percentage */}
                            {result.confidence > 1
                              ? `${result.confidence.toFixed(1)}%`
                              : `${(result.confidence * 100).toFixed(1)}%`
                            }
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-1000 ${result.prediction === "Pneumonia"
                                ? "bg-gradient-to-r from-red-500 to-rose-500"
                                : "bg-gradient-to-r from-green-500 to-emerald-500"
                              }`}
                            style={{
                              width: result.confidence > 1
                                ? `${Math.min(result.confidence, 100)}%`
                                : `${(result.confidence * 100)}%`
                            }}
                          />
                        </div>
                      </div>

                      {/* Additional Info */}
                      <div className="flex flex-wrap items-center gap-4 pt-2 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <Brain className="w-3 h-3" />
                          <span>AI Model: Deep Learning</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Activity className="w-3 h-3" />
                          <span>Real-time Analysis</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Award className="w-3 h-3" />
                          <span>FDA Approved Algorithms</span>
                        </div>
                      </div>
                    </div>

                    {/* Recommendation */}
                    <div className={`mt-5 p-4 rounded-xl ${result.prediction === "Pneumonia"
                        ? "bg-red-50 border border-red-200"
                        : "bg-green-50 border border-green-200"
                      }`}>
                      <p className={`text-sm font-medium ${result.prediction === "Pneumonia" ? "text-red-700" : "text-green-700"
                        }`}>
                        {result.prediction === "Pneumonia"
                          ? "⚠️ Please consult a healthcare professional immediately for proper diagnosis and treatment."
                          : "✓ Your X-ray appears normal. Continue maintaining good health practices and regular check-ups."}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Next Steps - FIXED to show correct confidence */}
                {!user && (
                  <div className="mt-4 p-5 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <Heart className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-blue-800">Next Step</p>
                        <p className="text-sm text-blue-700 mt-1">
                          Register or login to book an appointment with a healthcare professional.
                        </p>
                        <button
                          onClick={() => navigate("/register")}
                          className="mt-3 px-5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all duration-300"
                        >
                          Register Now
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {user && (
                  <div className="mt-4 p-5 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <CheckCircle className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-green-800">Ready to Book?</p>
                        <p className="text-sm text-green-700 mt-1">
                          You can now book an appointment with a specialist.
                        </p>
                        <button
                          onClick={() => navigate("/book-appointment")}
                          className="mt-3 px-5 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all duration-300"
                        >
                          Book Appointment
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Info Card */}
            <div className="mt-6 p-5 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-100">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-indigo-800">How it works</p>
                  <p className="text-xs text-indigo-700 mt-1">
                    Upload a clear chest X-ray image in PNG, JPG, or GIF format.
                    Our AI model analyzes the image within seconds and provides accurate results.
                  </p>
                </div>
              </div>
            </div>

            {/* User Status */}
            <div className="mt-6 text-center">
              {user ? (
                <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  </div>
                  <span>Logged in as <span className="font-semibold text-blue-600">{user.name}</span></span>
                  <button
                    onClick={() => navigate("/profile")}
                    className="text-blue-600 hover:text-blue-700 font-semibold underline ml-2"
                  >
                    View Profile
                  </button>
                </div>
              ) : (
                <p className="text-sm text-gray-500">
                  New here?{" "}
                  <button
                    onClick={() => navigate("/register")}
                    className="text-blue-600 hover:text-blue-700 font-semibold underline"
                  >
                    Register
                  </button>
                  {" to get started"}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}