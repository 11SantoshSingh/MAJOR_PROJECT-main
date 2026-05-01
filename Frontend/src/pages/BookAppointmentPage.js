import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Calendar, Clock, Search, MapPin, Star, DollarSign,
  ArrowLeft, CheckCircle, AlertCircle, Hospital,
  Stethoscope, FileText, ChevronRight, Filter, X,
  TrendingUp, Shield, Award, Sparkles, Heart, Users,
  CreditCard, Wallet
} from "lucide-react";
import PaymentModal from "../components/PaymentModal";

export default function BookAppointmentPage() {
  const [hospitals, setHospitals] = useState([]);
  const [filteredHospitals, setFilteredHospitals] = useState([]);
  const [searchCity, setSearchCity] = useState("");
  const [searchPincode, setSearchPincode] = useState("");
  const [searchName, setSearchName] = useState("");
  const [sortBy, setSortBy] = useState("rating");
  const [selectedHospital, setSelectedHospital] = useState(null);
  const [takenTimes, setTakenTimes] = useState([]);
  const [hospitalPrices, setHospitalPrices] = useState({});
  const [hospitalReviews, setHospitalReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [formData, setFormData] = useState({
    hospitalId: "",
    date: "",
    time: "",
    doctorSpecialty: "",
    notes: "",
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);
  const [hospitalsLoading, setHospitalsLoading] = useState(true);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [pendingAppointment, setPendingAppointment] = useState(null);
  const [bookingAmount, setBookingAmount] = useState(0);
  const navigate = useNavigate();

  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem("user"));
    } catch (e) {
      return null;
    }
  })();

  const doctorSpecialties = [
    "Pulmonologist",
    "General Physician",
    "Chest Specialist",
    "Internal Medicine",
    "Cardiologist",
    "Neurologist",
  ];

  const timeSlots = [
    "09:00", "09:30", "10:00", "10:30", "11:00",
    "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00",
  ];

  useEffect(() => {
    const fetchHospitals = async () => {
      try {
        setHospitalsLoading(true);
        const response = await axios.get("http://localhost:5001/api/doctors/");
        let list = [];
        if (Array.isArray(response.data)) {
          list = response.data;
        } else if (Array.isArray(response.data.doctors)) {
          list = response.data.doctors;
        }
        setHospitals(list);
        setFilteredHospitals(list);
        await fetchHospitalPrices(list);
      } catch (err) {
        setError("Failed to load hospitals");
      } finally {
        setHospitalsLoading(false);
      }
    };
    fetchHospitals();
  }, []);

  const fetchHospitalPrices = async (hospitalsList) => {
    const pricesMap = {};
    for (const hospital of hospitalsList) {
      try {
        const response = await axios.get(`http://localhost:5001/api/prices/hospital/${hospital._id}`);
        const prices = response.data.prices;
        const priceObj = {};
        prices.forEach(price => {
          priceObj[price.specialty] = price.charges;
        });
        pricesMap[hospital._id] = priceObj;
      } catch (err) {
        pricesMap[hospital._id] = {};
      }
    }
    setHospitalPrices(pricesMap);
  };

  const fetchHospitalReviews = async (hospitalId) => {
    try {
      setReviewsLoading(true);
      const response = await axios.get(`http://localhost:5001/api/reviews/hospital/${hospitalId}`);
      setHospitalReviews(response.data.reviews || []);
    } catch (err) {
      console.error("Failed to fetch reviews:", err);
      setHospitalReviews([]);
    } finally {
      setReviewsLoading(false);
    }
  };

  const getPrice = (hospitalId, specialty) => {
    const price = hospitalPrices[hospitalId]?.[specialty];
    return price || 500;
  };

  const getMinimumPrice = (hospitalId) => {
    const prices = hospitalPrices[hospitalId] || {};
    const values = Object.values(prices);
    if (values.length === 0) return 500;
    return Math.min(...values);
  };

  useEffect(() => {
    const fetchTakenTimes = async () => {
      if (!selectedHospital || !formData.date || !formData.doctorSpecialty) return;
      try {
        const response = await axios.get(
          `http://localhost:5001/api/appointments/availability?doctorId=${selectedHospital._id}&date=${formData.date}&specialty=${formData.doctorSpecialty}`
        );
        if (response.data.appointments) {
          setTakenTimes(response.data.appointments.map(a => a.time));
        }
      } catch (err) {
        console.error("Failed to fetch taken times", err);
      }
    };
    fetchTakenTimes();
  }, [selectedHospital, formData.date, formData.doctorSpecialty]);

  useEffect(() => {
    if (selectedHospital) {
      fetchHospitalReviews(selectedHospital._id);
    }
  }, [selectedHospital]);

  useEffect(() => {
    let filtered = [...hospitals];
    if (searchCity) {
      filtered = filtered.filter(h =>
        h.location?.toLowerCase().includes(searchCity.toLowerCase())
      );
    }
    if (searchPincode) {
      filtered = filtered.filter(h =>
        h.pincode?.toString().includes(searchPincode)
      );
    }
    if (searchName) {
      filtered = filtered.filter(h =>
        h.hospitalName?.toLowerCase().includes(searchName.toLowerCase())
      );
    }
    if (sortBy === "rating") {
      filtered.sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0));
    } else if (sortBy === "price") {
      filtered.sort((a, b) => getMinimumPrice(a._id) - getMinimumPrice(b._id));
    } else if (sortBy === "name") {
      filtered.sort((a, b) => (a.hospitalName || "").localeCompare(b.hospitalName || ""));
    }
    setFilteredHospitals(filtered);
  }, [searchCity, searchPincode, searchName, sortBy, hospitals, hospitalPrices]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!formData.hospitalId || !formData.date || !formData.time || !formData.doctorSpecialty) {
      setError("Please fill in all required fields");
      return;
    }

    if (takenTimes.includes(formData.time)) {
      setError(`Sorry, ${formData.time} slot is no longer available.`);
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      // First create the appointment with pending status
      const appointmentData = {
        doctorId: formData.hospitalId,
        date: formData.date,
        time: formData.time,
        doctorSpecialty: formData.doctorSpecialty,
        notes: formData.notes,
      };

      const appointmentResponse = await axios.post("http://localhost:5001/api/appointments/", appointmentData, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      const newAppointment = appointmentResponse.data.appointment;
      const amount = getPrice(selectedHospital._id, formData.doctorSpecialty);

      // Store pending appointment and show payment modal
      setPendingAppointment(newAppointment);
      setBookingAmount(amount);
      setShowPaymentModal(true);

    } catch (err) {
      console.error("Booking error:", err);
      setError(err.response?.data?.error || "Failed to book appointment");
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = (message) => {
    setSuccess(message);
    setShowPaymentModal(false);
    setPendingAppointment(null);

    // Reset form and redirect after delay
    setTimeout(() => {
      navigate("/profile");
    }, 2000);
  };

  const today = new Date().toISOString().split("T")[0];
  const maxDate = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-100 p-4 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-2xl p-8 text-center max-w-md animate-in fade-in zoom-in duration-300">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Heart className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Welcome Back!</h2>
          <p className="text-gray-600 mb-6">Please login to book an appointment with top hospitals.</p>
          <button
            onClick={() => navigate("/register")}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all duration-300"
          >
            Login / Register
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-100">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-full px-4 py-2 mb-4 shadow-sm">
            <Sparkles className="w-4 h-4 text-blue-600" />
            <span className="text-sm text-gray-600">Find the Best Healthcare</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent mb-3">
            Book an Appointment
          </h1>
          <p className="text-gray-600 text-lg">Select from top-rated hospitals and book your consultation</p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {!selectedHospital ? (
            <>
              {/* Search Section */}
              <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 px-6 py-8">
                <div className="flex items-center gap-2 mb-2">
                  <Search className="w-5 h-5 text-white/80" />
                  <span className="text-white/80 text-sm font-medium">Find Your Hospital</span>
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Search Hospitals</h2>
                <p className="text-white/70 text-sm">Search by name, city, or pincode to find hospitals near you</p>
              </div>

              <div className="p-6">
                {/* Search Inputs */}
                <div className="space-y-4 mb-6">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search by hospital name..."
                      value={searchName}
                      onChange={(e) => setSearchName(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
                    />
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search by city..."
                        value={searchCity}
                        onChange={(e) => setSearchCity(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
                      />
                    </div>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search by pincode..."
                        value={searchPincode}
                        onChange={(e) => setSearchPincode(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* Sort Options */}
                <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600">Sort by:</span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setSortBy("rating")}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-1 ${sortBy === "rating"
                            ? "bg-yellow-500 text-white shadow-md"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                          }`}
                      >
                        <Star className="w-3 h-3" /> Top Rated
                      </button>
                      <button
                        onClick={() => setSortBy("price")}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-1 ${sortBy === "price"
                            ? "bg-green-500 text-white shadow-md"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                          }`}
                      >
                        <DollarSign className="w-3 h-3" /> Price
                      </button>
                      <button
                        onClick={() => setSortBy("name")}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-1 ${sortBy === "name"
                            ? "bg-blue-500 text-white shadow-md"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                          }`}
                      >
                        <Hospital className="w-3 h-3" /> Name
                      </button>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500">
                    Found <span className="font-bold text-blue-600">{filteredHospitals.length}</span> hospitals
                  </p>
                </div>

                {(searchCity || searchPincode || searchName) && (
                  <button
                    onClick={() => { setSearchCity(""); setSearchPincode(""); setSearchName(""); setSortBy("rating"); }}
                    className="mb-4 text-sm text-red-500 hover:text-red-600 flex items-center gap-1"
                  >
                    <X className="w-3 h-3" /> Clear all filters
                  </button>
                )}

                {/* Hospital List */}
                {/* Hospital List */}
                {hospitalsLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="animate-pulse">
                        <div className="bg-gray-200 rounded-xl h-28"></div>
                      </div>
                    ))}
                  </div>
                ) : filteredHospitals.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Hospital className="w-10 h-10 text-gray-400" />
                    </div>
                    <p className="text-gray-500">No hospitals found matching your criteria</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                    {filteredHospitals.map((h, index) => (
                      <button
                        key={h._id}
                        onClick={() => {
                          setSelectedHospital(h);
                          setFormData(prev => ({ ...prev, hospitalId: h._id }));
                        }}
                        className="w-full text-left p-4 border-2 rounded-xl hover:border-blue-500 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-300 group"
                      >
                        <div className="flex gap-4">
                          {/* Hospital Profile Picture */}
                          <div className="flex-shrink-0">
                            {h.profilePicture ? (
                              <img
                                src={`http://localhost:5001${h.profilePicture}`}
                                alt={h.hospitalName}
                                className="w-16 h-16 rounded-xl object-cover border-2 border-gray-200 group-hover:border-blue-400 transition-all"
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src = "https://via.placeholder.com/64x64?text=🏥";
                                }}
                              />
                            ) : (
                              <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl flex items-center justify-center border-2 border-gray-200 group-hover:border-blue-400 transition-all">
                                <Hospital className="w-8 h-8 text-blue-500" />
                              </div>
                            )}
                          </div>

                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <h4 className="font-bold text-gray-800 text-lg">{h.hospitalName}</h4>
                              {sortBy === "rating" && index === 0 && (
                                <span className="bg-gradient-to-r from-yellow-500 to-amber-500 text-white text-xs px-2 py-0.5 rounded-full flex items-center gap-1">
                                  <Award className="w-3 h-3" /> Top Rated
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {h.location} | {h.pincode}
                            </p>

                            <div className="flex justify-between items-center mt-2">
                              <div className="flex items-center gap-2">
                                <div className="flex items-center gap-1">
                                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                  <span className="text-sm font-semibold text-gray-700">
                                    {h.averageRating ? h.averageRating.toFixed(1) : "New"}
                                  </span>
                                  <span className="text-xs text-gray-400">({h.totalReviews || 0} reviews)</span>
                                </div>
                                <div className="flex items-center gap-1 text-green-600">
                                  <DollarSign className="w-4 h-4" />
                                  <span className="font-semibold">From ₹{getMinimumPrice(h._id)}</span>
                                </div>
                              </div>
                              <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                            </div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              {/* Hospital Header */}
              {/* Hospital Header */}
              <div className="relative bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 px-6 py-6">
                <button
                  onClick={() => {
                    setSelectedHospital(null);
                    setFormData(prev => ({ ...prev, hospitalId: "", doctorSpecialty: "", time: "" }));
                  }}
                  className="absolute top-4 left-4 flex items-center gap-1 text-white/80 hover:text-white transition group"
                >
                  <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition" />
                  <span className="text-sm">Back to search</span>
                </button>

                <div className="flex flex-col items-center text-center mt-4">
                  {/* Hospital Profile Picture - Large */}
                  <div className="mb-3">
                    {selectedHospital.profilePicture ? (
                      <img
                        src={`http://localhost:5001${selectedHospital.profilePicture}`}
                        alt={selectedHospital.hospitalName}
                        className="w-24 h-24 rounded-2xl object-cover border-4 border-white shadow-lg"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "https://via.placeholder.com/96x96?text=🏥";
                        }}
                      />
                    ) : (
                      <div className="w-24 h-24 bg-white/20 rounded-2xl flex items-center justify-center border-4 border-white shadow-lg">
                        <Hospital className="w-12 h-12 text-white" />
                      </div>
                    )}
                  </div>

                  <div className="inline-flex items-center gap-2 bg-white/20 rounded-full px-4 py-1 mb-2">
                    <Hospital className="w-4 h-4 text-white" />
                    <span className="text-white/90 text-sm">Selected Hospital</span>
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-1">{selectedHospital.hospitalName}</h2>
                  <p className="text-white/80">{selectedHospital.location}, {selectedHospital.city}</p>
                  <div className="flex items-center justify-center gap-2 mt-2">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-white font-semibold">
                        {selectedHospital.averageRating ? selectedHospital.averageRating.toFixed(1) : "New"}
                      </span>
                      <span className="text-white/60 text-sm">({selectedHospital.totalReviews || 0} reviews)</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Booking Form */}
              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                    <Stethoscope className="w-4 h-4 text-blue-600" />
                    Select Doctor Specialty
                  </label>
                  <select
                    name="doctorSpecialty"
                    value={formData.doctorSpecialty}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all bg-gray-50/50"
                    required
                  >
                    <option value="">-- Select Specialty --</option>
                    {doctorSpecialties.map((specialty) => (
                      <option key={specialty} value={specialty}>
                        {specialty} - ₹{getPrice(selectedHospital._id, specialty)}
                      </option>
                    ))}
                  </select>
                </div>

                {formData.doctorSpecialty && (
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200 animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-5 h-5 text-green-600" />
                        <span className="text-green-800 font-semibold">Consultation Fee</span>
                      </div>
                      <span className="text-2xl font-bold text-green-700">
                        ₹{getPrice(selectedHospital._id, formData.doctorSpecialty)}
                      </span>
                    </div>
                    <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
                      <Shield className="w-3 h-3" /> Includes consultation and basic services
                    </p>
                  </div>
                )}

                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                    <Calendar className="w-4 h-4 text-blue-600" />
                    Appointment Date
                  </label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    min={today}
                    max={maxDate}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all bg-gray-50/50"
                    required
                  />
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                    <Clock className="w-4 h-4 text-blue-600" />
                    Select Time Slot
                    {formData.doctorSpecialty && (
                      <span className="text-xs text-gray-500 ml-2">
                        (Availability for {formData.doctorSpecialty})
                      </span>
                    )}
                  </label>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {timeSlots.map((slot) => {
                      const isTaken = takenTimes.includes(slot);
                      const isSelected = formData.time === slot;
                      return (
                        <button
                          key={slot}
                          type="button"
                          onClick={() => !isTaken && setFormData(prev => ({ ...prev, time: slot }))}
                          disabled={isTaken}
                          className={`py-2.5 px-2 rounded-xl font-medium transition-all duration-200 text-sm
                            ${isSelected
                              ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25 scale-105"
                              : isTaken
                                ? "bg-red-100 text-red-500 cursor-not-allowed line-through"
                                : "bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-105"
                            }`}
                        >
                          {slot} {isTaken && "❌"}
                        </button>
                      );
                    })}
                  </div>
                  {!formData.doctorSpecialty && (
                    <p className="text-sm text-amber-600 mt-2 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      Please select a specialty first to see available time slots
                    </p>
                  )}
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                    <FileText className="w-4 h-4 text-blue-600" />
                    Additional Notes (Optional)
                  </label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    rows="3"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all resize-none bg-gray-50/50"
                    placeholder="Any special requirements or symptoms to share with the doctor..."
                  />
                </div>

                {error && (
                  <div className="bg-red-50 rounded-xl p-4 border border-red-200 animate-in slide-in-from-top-2 duration-200">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-5 h-5 text-red-600" />
                      <p className="text-red-700 text-sm">{error}</p>
                    </div>
                  </div>
                )}

                {success && (
                  <div className="bg-green-50 rounded-xl p-4 border border-green-200 animate-in slide-in-from-top-2 duration-200">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <p className="text-green-700 text-sm">{success}</p>
                    </div>
                  </div>
                )}

                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => navigate("/profile")}
                    className="flex-1 py-3 px-4 rounded-xl font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-all duration-200 hover:scale-[1.02]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 py-3 px-4 rounded-xl font-semibold text-white bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Processing...</span>
                      </>
                    ) : (
                      <>
                        <CreditCard className="w-4 h-4" />
                        <span>Proceed to Payment</span>
                      </>
                    )}
                  </button>
                </div>
              </form>

              {/* Reviews Section */}
              <div className="border-t px-6 py-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-600" />
                  Patient Reviews ({hospitalReviews.length})
                </h3>

                {reviewsLoading ? (
                  <div className="text-center py-4">
                    <div className="inline-block animate-spin text-2xl">⏳</div>
                    <p className="text-gray-500 mt-2">Loading reviews...</p>
                  </div>
                ) : hospitalReviews.length === 0 ? (
                  <div className="text-center py-8 bg-gray-50 rounded-xl">
                    <p className="text-4xl mb-2">📭</p>
                    <p className="text-gray-500">No reviews yet. Be the first to review this hospital!</p>
                  </div>
                ) : (
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {hospitalReviews.map((review) => (
                      <div key={review._id} className="border rounded-xl p-4 bg-gray-50 hover:shadow-md transition-all duration-300">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center gap-2">
                            <div className="flex">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star key={star} className={`w-4 h-4 ${star <= review.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} />
                              ))}
                            </div>
                            <span className="font-semibold text-gray-800">
                              {review.patientId?.name || "Anonymous Patient"}
                            </span>
                          </div>
                          <span className="text-xs text-gray-500">
                            {new Date(review.createdAt).toLocaleDateString('en-IN', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </span>
                        </div>
                        <p className="text-gray-700 mt-2">{review.comment}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Info Box */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 mx-6 mb-6 p-4 rounded-xl border border-blue-100">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <TrendingUp className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-blue-800">Payment Info</p>
                    <p className="text-xs text-blue-600 mt-1">
                      You can pay online using Card, UPI, or NetBanking. Cash payment option also available at hospital counter.
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && pendingAppointment && (
        <PaymentModal
          appointment={pendingAppointment}
          amount={bookingAmount}
          onClose={() => {
            setShowPaymentModal(false);
            setPendingAppointment(null);
            setError("Payment cancelled. Please book again.");
          }}
          onSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  );
}