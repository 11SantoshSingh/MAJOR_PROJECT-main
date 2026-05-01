import React, { useState, useRef } from "react";
import axios from "axios";
import { Camera, Upload, X, Trash2, Loader2, CheckCircle, AlertCircle, Image as ImageIcon } from "lucide-react";

export default function ProfilePictureUpload({ currentPicture, onUploadSuccess }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [preview, setPreview] = useState(currentPicture || null);
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      await processFile(files[0]);
    }
  };

  const processFile = async (file) => {
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file (JPEG, PNG, GIF, WEBP)');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB');
      return;
    }

    // Show preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
    };
    reader.readAsDataURL(file);

    // Simulate upload progress
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      setUploadProgress(Math.min(progress, 90));
    }, 100);

    // Upload file
    const formData = new FormData();
    formData.append('profilePicture', file);

    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("token");
      
      const response = await axios.post(
        "http://localhost:5001/api/doctors/upload-profile-pic",
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}`
          },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(percentCompleted);
          }
        }
      );

      clearInterval(interval);
      setUploadProgress(100);
      
      if (response.data.success) {
        onUploadSuccess(response.data.profilePicture);
        setTimeout(() => setUploadProgress(0), 1000);
      }
    } catch (err) {
      console.error("Upload error:", err);
      setError(err.response?.data?.error || "Failed to upload image");
      setPreview(currentPicture || null);
      setUploadProgress(0);
      clearInterval(interval);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      await processFile(file);
    }
  };

  const handleRemove = async () => {
    if (!window.confirm("Are you sure you want to remove your profile picture?")) {
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      
      await axios.delete("http://localhost:5001/api/doctors/remove-profile-pic", {
        headers: { Authorization: `Bearer ${token}` }
      });

      setPreview(null);
      onUploadSuccess('');
      setError(null);
    } catch (err) {
      console.error("Remove error:", err);
      setError(err.response?.data?.error || "Failed to remove image");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center">
      {/* Profile Picture Container */}
      <div className="relative group">
        {/* Animated Ring */}
        <div className={`absolute inset-0 rounded-full transition-all duration-300 ${
          dragActive ? 'scale-110 bg-blue-500/20 ring-4 ring-blue-500' : ''
        }`}></div>
        
        {/* Main Avatar Circle */}
        <div 
          className={`relative w-32 h-32 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center overflow-hidden shadow-xl transition-all duration-300 ${
            dragActive ? 'scale-105' : 'group-hover:scale-105'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          {preview ? (
            <img 
              src={preview.startsWith('http') ? preview : `http://localhost:5001${preview}`} 
              alt="Profile" 
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
            />
          ) : (
            <div className="text-center">
              <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-1" />
              <span className="text-2xl">🏥</span>
            </div>
          )}
          
          {/* Upload Overlay */}
          {!preview && !loading && (
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
              <Upload className="w-8 h-8 text-white" />
            </div>
          )}
          
          {/* Loading Overlay */}
          {loading && (
            <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center">
              <Loader2 className="w-8 h-8 text-white animate-spin mb-1" />
              <span className="text-white text-xs font-medium">{uploadProgress}%</span>
            </div>
          )}
        </div>

        {/* Upload Progress Ring */}
        {loading && uploadProgress > 0 && uploadProgress < 100 && (
          <svg className="absolute top-0 left-0 w-32 h-32 -rotate-90">
            <circle
              cx="64"
              cy="64"
              r="60"
              fill="none"
              stroke="#e5e7eb"
              strokeWidth="4"
            />
            <circle
              cx="64"
              cy="64"
              r="60"
              fill="none"
              stroke="#3b82f6"
              strokeWidth="4"
              strokeDasharray={`${2 * Math.PI * 60}`}
              strokeDashoffset={`${2 * Math.PI * 60 * (1 - uploadProgress / 100)}`}
              className="transition-all duration-300"
            />
          </svg>
        )}

        {/* Edit Button */}
        <label 
          htmlFor="profile-pic-input"
          className={`absolute bottom-0 right-0 bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-2.5 rounded-full cursor-pointer transition-all duration-300 shadow-lg ${
            loading ? 'opacity-50 cursor-not-allowed' : 'hover:scale-110 hover:shadow-xl'
          }`}
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Camera className="w-4 h-4" />
          )}
        </label>
        <input
          ref={fileInputRef}
          id="profile-pic-input"
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
          disabled={loading}
        />
      </div>

      {/* Action Buttons */}
      {preview && (
        <button
          onClick={handleRemove}
          disabled={loading}
          className="mt-4 group flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl font-medium text-sm transition-all duration-300 hover:shadow-lg hover:shadow-red-500/25 hover:scale-105 disabled:opacity-50"
        >
          <Trash2 className="w-4 h-4 transition-transform group-hover:rotate-12" />
          <span>{loading ? "Processing..." : "Remove Picture"}</span>
        </button>
      )}

      {/* Drag & Drop Hint */}
      {!preview && !loading && (
        <div className="mt-4 text-center">
          <p className="text-xs text-gray-500">
            Drag & drop or click the camera icon
          </p>
          <p className="text-xs text-gray-400 mt-1">
            JPEG, PNG, GIF up to 5MB
          </p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mt-4 bg-red-50 rounded-xl p-3 border border-red-200 animate-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
            <p className="text-red-700 text-xs font-medium">{error}</p>
          </div>
        </div>
      )}

      {/* Success Hint */}
      {preview && !loading && !error && (
        <div className="mt-3 flex items-center gap-1 text-green-600 text-xs">
          <CheckCircle className="w-3 h-3" />
          <span>Profile picture updated</span>
        </div>
      )}

      {/* Instructions */}
      <div className="mt-4 p-3 bg-blue-50 rounded-xl border border-blue-200 max-w-xs">
        <div className="flex items-start gap-2">
          <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
            <span className="text-white text-xs">💡</span>
          </div>
          <div>
            <p className="text-xs font-semibold text-blue-800">Pro Tip</p>
            <p className="text-xs text-blue-600 mt-0.5">
              A professional profile picture helps build trust with patients. Recommended size: 500x500px.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}