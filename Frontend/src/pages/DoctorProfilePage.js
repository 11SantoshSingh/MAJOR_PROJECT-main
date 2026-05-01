import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { 
  User, Mail, Phone, MapPin, Building, CreditCard, 
  LogOut, Edit2, Save, X, Calendar, Award, 
  Shield, CheckCircle, AlertCircle, TrendingUp, 
  Hospital, Star, Clock, FileText, Settings, 
  DollarSign, Activity, Heart, Sparkles
} from "lucide-react";
import PriceManagement from "../components/PriceManagement";
import ProfilePictureUpload from "../components/ProfilePictureUpload";

export default function DoctorProfilePage() {
  const navigate = useNavigate();
  const [hospital, setHospital] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showUpdateForm, setShowUpdateForm] = useState(false);
  const [updateData, setUpdateData] = useState({
    hospitalName: "",
    phone: "",
    location: "",
    city: "",
    pincode: "",
    licenseNumber: "",
  });

  useEffect(() => {
    const loadHospitalData = () => {
      try {
        let doctorData = localStorage.getItem("doctor");
        if (doctorData) {
          const parsedData = JSON.parse(doctorData);
          setHospital(parsedData);
          setUpdateData({
            hospitalName: parsedData.hospitalName || "",
            phone: parsedData.phone || "",
            location: parsedData.location || "",
            city: parsedData.city || "",
            pincode: parsedData.pincode || "",
            licenseNumber: parsedData.licenseNumber || "",
          });
        }
      } catch (e) {
        console.error("Error loading hospital data:", e);
      }
    };
    loadHospitalData();
  }, []);

  const handleProfilePictureUpdate = (newPictureUrl) => {
    setHospital(prev => ({ ...prev, profilePicture: newPictureUrl }));
    const updatedDoctor = { ...hospital, profilePicture: newPictureUrl };
    localStorage.setItem("doctor", JSON.stringify(updatedDoctor));
  };

  if (!hospital) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-2xl p-8 text-center max-w-md animate-in fade-in zoom-in duration-300">
          <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Hospital className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Not Logged In</h2>
          <p className="text-gray-600 mb-6">Please login as a hospital to access your profile.</p>
          <button
            onClick={() => navigate("/doctor-register")}
            className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all duration-300"
          >
            Login as Hospital
          </button>
        </div>
      </div>
    );
  }

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userType");
    localStorage.removeItem("doctor");
    navigate("/doctor-register");
  };

  const handleUpdateChange = (e) => {
    const { name, value } = e.target;
    setUpdateData((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await axios.put("http://localhost:5001/api/doctors/profile", updateData, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (response.data.doctor) {
        const updatedDoctor = response.data.doctor;
        setHospital(updatedDoctor);
        localStorage.setItem("doctor", JSON.stringify(updatedDoctor));
        setSuccess("Profile updated successfully!");
        setTimeout(() => setSuccess(null), 3000);
      }
      setShowUpdateForm(false);
    } catch (err) {
      console.error("Update failed", err);
      setError(err.response?.data?.error || err.message || "Update failed");
      setTimeout(() => setError(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  const hospitalId = hospital.id || hospital._id;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-full px-4 py-2 mb-2 shadow-sm">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span className="text-sm text-gray-600">Hospital Dashboard</span>
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
              Hospital Profile
            </h1>
          </div>
          <button
            onClick={handleLogout}
            className="group flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-red-500/25 hover:scale-105 transition-all duration-300"
          >
            <LogOut className="w-4 h-4 transition-transform group-hover:rotate-12" />
            <span>Logout</span>
          </button>
        </div>

        {/* Success Message */}
        {success && (
          <div className="mb-6 bg-green-50 rounded-xl p-4 border border-green-200 animate-in slide-in-from-top-2 duration-200">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <p className="text-green-700 font-medium">{success}</p>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 rounded-xl p-4 border border-red-200 animate-in slide-in-from-top-2 duration-200">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <p className="text-red-700 font-medium">{error}</p>
            </div>
          </div>
        )}

        {/* Profile Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-6">
          {/* Gradient Header */}
          <div className="relative h-32 bg-gradient-to-r from-indigo-600 via-blue-600 to-purple-600">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12"></div>
          </div>

          <div className="px-8 py-6 relative">
            {/* Profile Picture */}
            <div className="flex justify-center -mt-16 mb-6">
              <ProfilePictureUpload 
                currentPicture={hospital.profilePicture}
                onUploadSuccess={handleProfilePictureUpdate}
              />
            </div>

            {/* Hospital Name & Rating */}
            <div className="text-center mb-8">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Hospital className="w-5 h-5 text-indigo-600" />
                <h2 className="text-2xl font-bold text-gray-800">{hospital.hospitalName}</h2>
              </div>
              <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                <Mail className="w-4 h-4" />
                <span>{hospital.email}</span>
              </div>
              <div className="flex items-center justify-center gap-4 mt-2">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm font-semibold text-gray-700">
                    {hospital.averageRating ? hospital.averageRating.toFixed(1) : "New"}
                  </span>
                  <span className="text-xs text-gray-400">({hospital.totalReviews || 0} reviews)</span>
                </div>
                <div className="text-xs text-gray-400">ID: {hospitalId}</div>
              </div>
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="group p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl hover:shadow-md transition-all duration-300">
                <div className="flex items-center gap-2 mb-2">
                  <Phone className="w-4 h-4 text-green-600" />
                  <p className="text-xs text-gray-500 font-medium">Phone Number</p>
                </div>
                <p className="text-lg font-semibold text-gray-800">{hospital.phone || "Not set"}</p>
              </div>
              <div className="group p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl hover:shadow-md transition-all duration-300">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="w-4 h-4 text-orange-600" />
                  <p className="text-xs text-gray-500 font-medium">Pincode</p>
                </div>
                <p className="text-lg font-semibold text-gray-800">{hospital.pincode || "Not set"}</p>
              </div>
              <div className="group p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl hover:shadow-md transition-all duration-300">
                <div className="flex items-center gap-2 mb-2">
                  <Award className="w-4 h-4 text-purple-600" />
                  <p className="text-xs text-gray-500 font-medium">License Number</p>
                </div>
                <p className="text-lg font-semibold text-gray-800">{hospital.licenseNumber || "Not set"}</p>
              </div>
              <div className="group p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl hover:shadow-md transition-all duration-300">
                <div className="flex items-center gap-2 mb-2">
                  <Building className="w-4 h-4 text-blue-600" />
                  <p className="text-xs text-gray-500 font-medium">Location</p>
                </div>
                <p className="text-lg font-semibold text-gray-800">{hospital.location || "Not set"}</p>
              </div>
              <div className="group p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl hover:shadow-md transition-all duration-300">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="w-4 h-4 text-teal-600" />
                  <p className="text-xs text-gray-500 font-medium">City</p>
                </div>
                <p className="text-lg font-semibold text-gray-800">{hospital.city || "Not set"}</p>
              </div>
              <div className="group p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl hover:shadow-md transition-all duration-300">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-4 h-4 text-indigo-600" />
                  <p className="text-xs text-gray-500 font-medium">Member Since</p>
                </div>
                <p className="text-lg font-semibold text-gray-800">
                  {new Date(hospital.createdAt).toLocaleDateString() || "Recent"}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 mt-8">
              <button
                onClick={() => setShowUpdateForm(!showUpdateForm)}
                className="flex-1 py-3 px-4 rounded-xl font-semibold bg-gradient-to-r from-indigo-600 to-blue-600 text-white hover:shadow-lg hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2"
              >
                <Edit2 className="w-4 h-4" />
                <span>{showUpdateForm ? "Cancel" : "Edit Profile"}</span>
              </button>
              <button
                onClick={() => navigate("/hospital-appointments")}
                className="flex-1 py-3 px-4 rounded-xl font-semibold bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:shadow-lg hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2"
              >
                <Calendar className="w-4 h-4" />
                <span>View Appointments</span>
              </button>
            </div>
          </div>
        </div>

        {/* Price Management Section */}
        <div className="mt-6">
          <PriceManagement />
        </div>

        {/* Update Form Modal */}
        {showUpdateForm && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom-10 duration-300">
              <div className="bg-gradient-to-r from-indigo-600 to-blue-600 px-6 py-4 sticky top-0">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-xl font-bold text-white">Update Profile</h3>
                    <p className="text-white/70 text-sm">Edit your hospital information</p>
                  </div>
                  <button
                    onClick={() => setShowUpdateForm(false)}
                    className="text-white/70 hover:text-white transition p-1 rounded-full hover:bg-white/10"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <form onSubmit={handleUpdateSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Hospital Name
                  </label>
                  <input
                    type="text"
                    name="hospitalName"
                    value={updateData.hospitalName}
                    onChange={handleUpdateChange}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={updateData.phone}
                    onChange={handleUpdateChange}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Location / Address
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={updateData.location}
                    onChange={handleUpdateChange}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={updateData.city}
                    onChange={handleUpdateChange}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Pincode
                  </label>
                  <input
                    type="text"
                    name="pincode"
                    value={updateData.pincode}
                    onChange={handleUpdateChange}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    License Number
                  </label>
                  <input
                    type="text"
                    name="licenseNumber"
                    value={updateData.licenseNumber}
                    onChange={handleUpdateChange}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowUpdateForm(false)}
                    className="flex-1 py-3 px-4 rounded-xl font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-all duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 py-3 px-4 rounded-xl font-semibold text-white bg-gradient-to-r from-indigo-600 to-blue-600 hover:shadow-lg hover:scale-105 transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        <span>Save Changes</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}