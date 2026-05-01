import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { 
  Mail, Lock, Phone, Building, MapPin, 
  CreditCard, User, Eye, EyeOff, 
  CheckCircle, AlertCircle, Hospital, 
  ArrowRight, Sparkles, Shield, Star
} from "lucide-react";

export default function DoctorRegisterPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isLogin, setIsLogin] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [formError, setFormError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    hospitalName: "",
    location: "",
    city: "",
    pincode: "",
    licenseNumber: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setFormError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    setSuccessMessage("");

    if (isLogin) {
      if (!formData.email || !formData.password) {
        setFormError("Please fill in all fields");
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const response = await axios.post("http://localhost:5001/api/doctors/login", {
          email: formData.email,
          password: formData.password,
        });
        
        if (response.data.token) {
          localStorage.setItem("token", response.data.token);
          localStorage.setItem("userType", "doctor");
          
          const doctorData = {
            _id: response.data.doctor.id,
            id: response.data.doctor.id,
            hospitalName: response.data.doctor.hospitalName,
            email: response.data.doctor.email,
            phone: response.data.doctor.phone,
            location: response.data.doctor.location,
            city: response.data.doctor.city,
            pincode: response.data.doctor.pincode,
            licenseNumber: response.data.doctor.licenseNumber
          };
          
          localStorage.setItem("doctor", JSON.stringify(doctorData));
        }
        setSuccessMessage("Login successful! Redirecting...");
        setTimeout(() => navigate("/doctor-profile"), 1500);
      } catch (err) {
        setFormError(err.response?.data?.error || err.message || "Login failed");
        setError(err.response?.data?.error || err.message || null);
      } finally {
        setLoading(false);
      }
    } else {
      if (
        !formData.email ||
        !formData.password ||
        !formData.confirmPassword ||
        !formData.phone ||
        !formData.hospitalName ||
        !formData.location ||
        !formData.city ||
        !formData.pincode ||
        !formData.licenseNumber
      ) {
        setFormError("Please fill in all fields");
        return;
      }

      if (formData.password !== formData.confirmPassword) {
        setFormError("Passwords do not match");
        return;
      }

      if (formData.password.length < 6) {
        setFormError("Password must be at least 6 characters");
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const response = await axios.post("http://localhost:5001/api/doctors/register", {
          email: formData.email,
          password: formData.password,
          phone: formData.phone,
          hospitalName: formData.hospitalName,
          location: formData.location,
          city: formData.city,
          pincode: formData.pincode,
          licenseNumber: formData.licenseNumber,
        });
        
        if (response.data.token) {
          localStorage.setItem("token", response.data.token);
          localStorage.setItem("userType", "doctor");
          
          const doctorData = {
            _id: response.data.doctor.id,
            id: response.data.doctor.id,
            hospitalName: response.data.doctor.hospitalName,
            email: response.data.doctor.email,
            phone: response.data.doctor.phone,
            location: response.data.doctor.location,
            city: response.data.doctor.city,
            pincode: response.data.doctor.pincode,
            licenseNumber: response.data.doctor.licenseNumber
          };
          
          localStorage.setItem("doctor", JSON.stringify(doctorData));
        }
        setSuccessMessage("Registration successful! Redirecting...");
        setTimeout(() => navigate("/doctor-profile"), 1500);
      } catch (err) {
        setFormError(err.response?.data?.error || err.message || "Registration failed");
        setError(err.response?.data?.error || err.message || null);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleModeToggle = () => {
    setIsLogin(!isLogin);
    setFormData({
      email: "",
      password: "",
      confirmPassword: "",
      phone: "",
      hospitalName: "",
      location: "",
      city: "",
      pincode: "",
      licenseNumber: "",
    });
    setFormError("");
    setSuccessMessage("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50 py-12 px-4">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-full px-4 py-2 mb-4 shadow-sm">
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <span className="text-sm text-gray-600">Healthcare Partner</span>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent mb-2">
            Hospital Portal
          </h1>
          <p className="text-gray-600">
            {isLogin ? "Welcome back to MediCare" : "Join India's leading healthcare network"}
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Mode Toggle */}
          <div className="grid grid-cols-2 gap-1 p-1 bg-gray-100 rounded-xl m-4">
            <button
              onClick={handleModeToggle}
              className={`py-2.5 px-4 rounded-lg font-semibold transition-all duration-300 ${
                !isLogin
                  ? "bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-md"
                  : "text-gray-600 hover:bg-gray-200"
              }`}
            >
              Register
            </button>
            <button
              onClick={handleModeToggle}
              className={`py-2.5 px-4 rounded-lg font-semibold transition-all duration-300 ${
                isLogin
                  ? "bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-md"
                  : "text-gray-600 hover:bg-gray-200"
              }`}
            >
              Login
            </button>
          </div>

          <div className="p-6">
            {/* Messages */}
            {successMessage && (
              <div className="mb-4 bg-green-50 rounded-xl p-4 border border-green-200 animate-in slide-in-from-top-2 duration-200">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <p className="text-green-700 text-sm font-medium">{successMessage}</p>
                </div>
              </div>
            )}
            
            {formError && (
              <div className="mb-4 bg-red-50 rounded-xl p-4 border border-red-200 animate-in slide-in-from-top-2 duration-200">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                  <p className="text-red-700 text-sm font-medium">{formError}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Hospital Name */}
              {(!isLogin || (isLogin && !formData.hospitalName)) && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Hospital Name
                  </label>
                  <div className="relative">
                    <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      name="hospitalName"
                      value={formData.hospitalName}
                      onChange={handleChange}
                      placeholder="e.g., City Hospital"
                      className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all"
                    />
                  </div>
                </div>
              )}

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="hospital@example.com"
                    className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-12 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password - Register Only */}
              {!isLogin && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-12 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              )}

              {/* Registration Fields */}
              {!isLogin && (
                <>
                  {/* Phone */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="+91 1234567890"
                        className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all"
                      />
                    </div>
                  </div>

                  {/* Location */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Location / Address
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        name="location"
                        value={formData.location}
                        onChange={handleChange}
                        placeholder="Street address"
                        className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all"
                      />
                    </div>
                  </div>

                  {/* City */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      City
                    </label>
                    <div className="relative">
                      <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        placeholder="e.g., Mumbai"
                        className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all"
                      />
                    </div>
                  </div>

                  {/* Pincode */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Pincode
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        name="pincode"
                        value={formData.pincode}
                        onChange={handleChange}
                        placeholder="400001"
                        className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all"
                      />
                    </div>
                  </div>

                  {/* License Number */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      License Number
                    </label>
                    <div className="relative">
                      <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        name="licenseNumber"
                        value={formData.licenseNumber}
                        onChange={handleChange}
                        placeholder="LIC123456789"
                        className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-semibold rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-6"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <span>{isLogin ? "Login to Dashboard" : "Create Account"}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Info Box */}
        <div className="mt-6 p-4 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl border border-indigo-100">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center flex-shrink-0">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-indigo-800">Why join MediCare?</p>
              <p className="text-xs text-indigo-600 mt-1">
                ✓ Reach thousands of patients • ✓ Manage appointments easily • 
                ✓ Boost your hospital's visibility • ✓ Get verified badge
              </p>
            </div>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="mt-4 flex justify-center gap-4 text-xs text-gray-400">
          <div className="flex items-center gap-1">
            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
            <span>Trusted by 1000+ Hospitals</span>
          </div>
          <div className="flex items-center gap-1">
            <Shield className="w-3 h-3 text-green-500" />
            <span>Secure Platform</span>
          </div>
        </div>
      </div>
    </div>
  );
}