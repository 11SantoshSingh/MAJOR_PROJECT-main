import React, { useState, useEffect } from "react";
import axios from "axios";
import { 
  DollarSign, Edit2, Save, X, RefreshCw, 
  TrendingUp, AlertCircle, CheckCircle, 
  CreditCard, Stethoscope, Plus, Trash2
} from "lucide-react";

export default function PriceManagement() {
  const [prices, setPrices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState("");

  const specialties = [
    { name: "Pulmonologist", icon: "🫁", color: "from-cyan-500 to-blue-500", bgColor: "bg-cyan-50" },
    { name: "General Physician", icon: "👨‍⚕️", color: "from-emerald-500 to-green-500", bgColor: "bg-emerald-50" },
    { name: "Chest Specialist", icon: "🫀", color: "from-rose-500 to-red-500", bgColor: "bg-rose-50" },
    { name: "Internal Medicine", icon: "🏥", color: "from-purple-500 to-indigo-500", bgColor: "bg-purple-50" },
    { name: "Cardiologist", icon: "❤️", color: "from-pink-500 to-rose-500", bgColor: "bg-pink-50" },
    { name: "Neurologist", icon: "🧠", color: "from-violet-500 to-purple-500", bgColor: "bg-violet-50" }
  ];

  useEffect(() => {
    fetchPrices();
  }, []);

  const fetchPrices = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("token");
      const doctorStr = localStorage.getItem("doctor");
      
      if (!doctorStr) {
        setError("No hospital data found. Please login again.");
        setLoading(false);
        return;
      }
      
      const doctor = JSON.parse(doctorStr);
      const hospitalId = doctor._id || doctor.id;
      
      if (!hospitalId) {
        setError("Invalid hospital data. Please login again.");
        setLoading(false);
        return;
      }
      
      const response = await axios.get(`http://localhost:5001/api/prices/hospital/${hospitalId}`);
      setPrices(response.data.prices || []);
    } catch (err) {
      console.error("Failed to load prices:", err);
      if (err.response?.status === 404) {
        setPrices([]);
      } else {
        setError(err.response?.data?.error || "Failed to load prices");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSetPrice = async (specialty, charges) => {
    if (!charges || charges < 0) {
      setError("Please enter a valid amount");
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("token");
      
      if (!token) {
        setError("No authentication token. Please login again.");
        return;
      }
      
      const response = await axios.post(
        "http://localhost:5001/api/prices",
        { specialty, charges: parseInt(charges) },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setSuccess(`Price for ${specialty} set to ₹${charges}`);
      await fetchPrices();
      setTimeout(() => setSuccess(null), 3000);
      setEditingId(null);
      setEditValue("");
    } catch (err) {
      console.error("Failed to set price:", err);
      setError(err.response?.data?.error || "Failed to set price");
      setTimeout(() => setError(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  const getPriceForSpecialty = (specialtyName) => {
    const price = prices.find(p => p.specialty === specialtyName);
    return price ? price.charges : null;
  };

  const getSpecialtyIcon = (specialtyName) => {
    const specialty = specialties.find(s => s.name === specialtyName);
    return specialty ? specialty.icon : "💊";
  };

  const getSpecialtyColor = (specialtyName) => {
    const specialty = specialties.find(s => s.name === specialtyName);
    return specialty || specialties[0];
  };

  // Show login prompt if no doctor data
  const doctorStr = localStorage.getItem("doctor");
  if (!doctorStr) {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
        <div className="w-20 h-20 bg-gradient-to-br from-red-100 to-red-200 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-10 h-10 text-red-500" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-3">💰 Price Management</h2>
        <p className="text-gray-600 mb-6">Please login as a hospital to manage consultation prices.</p>
        <button 
          onClick={() => window.location.href = "/doctor-register"}
          className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all duration-300"
        >
          Go to Login
        </button>
      </div>
    );
  }

  if (loading && prices.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
            💰 Price Management
          </h2>
          <div className="animate-spin">
            <RefreshCw className="w-5 h-5 text-blue-500" />
          </div>
        </div>
        <div className="space-y-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-200 rounded-xl h-20"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 px-6 py-8">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <CreditCard className="w-6 h-6 text-white" />
              <span className="text-white/80 text-sm font-medium">Price Management</span>
            </div>
            <h2 className="text-2xl font-bold text-white">Consultation Fees</h2>
            <p className="text-white/70 text-sm mt-1">Set and manage prices for different specialties</p>
          </div>
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
            <DollarSign className="w-6 h-6 text-white" />
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Stats Summary */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
            <p className="text-xs text-green-600 font-medium">Total Specialties</p>
            <p className="text-2xl font-bold text-green-700">{specialties.length}</p>
          </div>
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
            <p className="text-xs text-blue-600 font-medium">Prices Configured</p>
            <p className="text-2xl font-bold text-blue-700">{prices.length}</p>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 bg-gradient-to-r from-red-50 to-rose-50 rounded-xl p-4 border border-red-200 animate-in slide-in-from-top-2 duration-200">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-red-700 text-sm font-medium">{error}</p>
              </div>
              <button 
                onClick={fetchPrices}
                className="px-3 py-1 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 transition"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {/* Success Alert */}
        {success && (
          <div className="mb-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200 animate-in slide-in-from-top-2 duration-200">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <p className="text-green-700 text-sm font-medium">{success}</p>
            </div>
          </div>
        )}

        {/* Price Cards */}
        <div className="space-y-3">
          {specialties.map((specialty) => {
            const currentPrice = getPriceForSpecialty(specialty.name);
            const isEditing = editingId === specialty.name;
            const specialtyColor = getSpecialtyColor(specialty.name);

            return (
              <div 
                key={specialty.name} 
                className={`group relative overflow-hidden rounded-xl transition-all duration-300 hover:shadow-lg border-2 ${
                  isEditing ? 'border-blue-500 shadow-lg' : 'border-gray-100'
                }`}
              >
                {/* Background Pattern */}
                <div className="absolute inset-0 bg-gradient-to-r opacity-5 pointer-events-none"></div>
                
                <div className="relative p-4">
                  <div className="flex justify-between items-center flex-wrap gap-4">
                    {/* Left Section - Specialty Info */}
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 bg-gradient-to-br ${specialtyColor.color} rounded-xl flex items-center justify-center text-2xl shadow-lg`}>
                        {specialty.icon}
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-800 text-lg">{specialty.name}</h3>
                        {currentPrice ? (
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-gray-500">Current Fee</span>
                            <span className="text-xl font-bold text-green-600">₹{currentPrice}</span>
                            <span className="text-xs text-gray-400 line-through">₹500</span>
                          </div>
                        ) : (
                          <p className="text-sm text-gray-500 mt-1">
                            Default: <span className="font-medium">₹500</span>
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Right Section - Actions */}
                    <div className="flex items-center gap-2">
                      {isEditing ? (
                        <>
                          <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-1">
                            <span className="text-gray-600 font-medium ml-2">₹</span>
                            <input
                              type="number"
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              placeholder="Amount"
                              className="w-28 px-3 py-2 border-0 bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg text-right"
                              min="0"
                              autoFocus
                            />
                          </div>
                          <button
                            onClick={() => handleSetPrice(specialty.name, parseInt(editValue))}
                            className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg font-semibold hover:shadow-lg hover:scale-105 transition-all duration-200 flex items-center gap-2"
                          >
                            <Save className="w-4 h-4" />
                            <span className="hidden sm:inline">Save</span>
                          </button>
                          <button
                            onClick={() => {
                              setEditingId(null);
                              setEditValue("");
                            }}
                            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-all duration-200 flex items-center gap-2"
                          >
                            <X className="w-4 h-4" />
                            <span className="hidden sm:inline">Cancel</span>
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => {
                            setEditingId(specialty.name);
                            setEditValue(currentPrice?.toString() || "500");
                          }}
                          className={`px-5 py-2 bg-gradient-to-r ${specialtyColor.color} text-white rounded-lg font-semibold hover:shadow-lg hover:scale-105 transition-all duration-200 flex items-center gap-2`}
                        >
                          <Edit2 className="w-4 h-4" />
                          <span>{currentPrice ? "Update" : "Set Price"}</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Info Footer */}
        <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
              <TrendingUp className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-blue-800">Pricing Strategy</p>
              <p className="text-xs text-blue-600 mt-1">
                Set competitive prices for different specialties. Default price is ₹500 if not set.
                Higher-rated hospitals can charge premium prices.
              </p>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="mt-4 flex justify-between items-center text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>Configured: {prices.length}/{specialties.length}</span>
          </div>
          <button
            onClick={fetchPrices}
            className="flex items-center gap-1 text-blue-600 hover:text-blue-700 transition"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Refresh</span>
          </button>
        </div>
      </div>
    </div>
  );
}