import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { 
  User, Mail, Phone, MapPin, Calendar, Clock, 
  LogOut, Plus, Star, CheckCircle, XCircle, 
  RefreshCw, AlertCircle, Hospital, Stethoscope,
  FileText, Edit2, Trash2, Heart, Activity,
  Award, TrendingUp, Sparkles, ChevronRight,
  Building, CreditCard
} from "lucide-react";
import RescheduleModal from "../components/Appointment/RescheduleModal";
import ReviewModal from "../components/ReviewModal";

export default function ProfilePage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("user"));
    } catch (e) {
      return null;
    }
  });
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [rescheduleId, setRescheduleId] = useState(null);
  const [cancelLoading, setCancelLoading] = useState(null);
  const [error, setError] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userType");
    localStorage.removeItem("user");
    localStorage.removeItem("doctor");
    setUser(null);
    setAppointments([]);
  };

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:5001/api/appointments/my-appointments", {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (response.data.appointments) {
        const appointmentsWithReviewStatus = await Promise.all(
          response.data.appointments.map(async (apt) => {
            try {
              const reviewResponse = await axios.get(
                `http://localhost:5001/api/reviews/appointment/${apt._id}`,
                {
                  headers: token ? { Authorization: `Bearer ${token}` } : {},
                }
              );
              return { ...apt, hasReview: reviewResponse.data.exists };
            } catch {
              return { ...apt, hasReview: false };
            }
          })
        );
        setAppointments(appointmentsWithReviewStatus.map((apt) => ({ id: apt._id, ...apt })));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const cancelAppointment = async (appointmentId) => {
    try {
      setCancelLoading(appointmentId);
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:5001/api/appointments/${appointmentId}/cancel`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      setAppointments((prev) => prev.filter((apt) => apt.id !== appointmentId));
    } catch (err) {
      throw err;
    } finally {
      setCancelLoading(null);
    }
  };

  const rescheduleAppointment = async (appointmentId, date, time) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(`http://localhost:5001/api/appointments/${appointmentId}/reschedule`, { date, time }, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      setAppointments((prev) => prev.map((apt) => (apt.id === appointmentId ? { ...apt, date, time, status: "rescheduled" } : apt)));
      return true;
    } catch (err) {
      throw err;
    }
  };

  const handleReviewClick = (appointment) => {
    setSelectedAppointment(appointment);
    setShowReviewModal(true);
  };

  const handleReviewSubmitted = () => {
    fetchAppointments();
  };

  useEffect(() => {
    if (user) {
      fetchAppointments();
    }
  }, [user]);

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-2xl p-8 text-center max-w-md animate-in fade-in zoom-in duration-300">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Heart className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Authentication Required</h2>
          <p className="text-gray-600 mb-6">Please register or login first to view your profile.</p>
          <button
            onClick={() => navigate("/register")}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all duration-300"
          >
            Go to Registration
          </button>
        </div>
      </div>
    );
  }

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      logout();
      navigate("/");
    }
  };

  const handleCancel = async (appointmentId) => {
    if (window.confirm("Are you sure you want to cancel this appointment?")) {
      try {
        setCancelLoading(appointmentId);
        setError(null);
        await cancelAppointment(appointmentId);
      } catch (err) {
        setError(err.message || "Failed to cancel appointment");
      } finally {
        setCancelLoading(null);
      }
    }
  };

  const handleReschedule = async (appointmentId, newDate, newTime) => {
    try {
      setError(null);
      await rescheduleAppointment(appointmentId, newDate, newTime);
      setRescheduleId(null);
    } catch (err) {
      setError(err.message || "Failed to reschedule appointment");
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "confirmed":
        return { color: "bg-green-500", icon: <CheckCircle className="w-3 h-3" />, text: "Confirmed" };
      case "rescheduled":
        return { color: "bg-orange-500", icon: <RefreshCw className="w-3 h-3" />, text: "Rescheduled" };
      case "completed":
        return { color: "bg-purple-500", icon: <Award className="w-3 h-3" />, text: "Completed" };
      case "cancelled":
        return { color: "bg-red-500", icon: <XCircle className="w-3 h-3" />, text: "Cancelled" };
      default:
        return { color: "bg-gray-500", icon: <Activity className="w-3 h-3" />, text: status };
    }
  };

  const stats = {
    total: appointments.length,
    confirmed: appointments.filter(a => a.status === "confirmed").length,
    completed: appointments.filter(a => a.status === "completed").length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 md:py-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-5 h-5 text-white/80" />
                <span className="text-white/80 text-sm font-medium">Patient Dashboard</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold">My Profile</h1>
              <p className="text-white/70 text-sm mt-1">Manage your appointments and health journey</p>
            </div>
            <button
              onClick={handleLogout}
              className="group flex items-center gap-2 px-4 py-2 bg-white/20 rounded-xl hover:bg-white/30 transition-all duration-300"
            >
              <LogOut className="w-4 h-4 transition-transform group-hover:rotate-12" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 md:py-8">
        {/* Profile Card - Improved Layout */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 h-20 sm:h-24"></div>
          <div className="px-4 sm:px-6 pb-6 relative">
            <div className="flex flex-col sm:flex-row gap-4 -mt-10 sm:-mt-12 mb-4 sm:mb-6">
              <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center shadow-lg border-4 border-white mx-auto sm:mx-0">
                <User className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
              </div>
              <div className="text-center sm:text-left flex-1">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-800">{user.name}</h2>
                <p className="text-black text-sm pt-8">Patient ID: {user.id?.substring(0, 8)}</p>
              </div>
            </div>

            {/* User Details Grid - Responsive */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-4">
              <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl">
                <Mail className="w-4 h-4 text-blue-500 flex-shrink-0" />
                <span className="text-sm text-gray-700 truncate">{user.email}</span>
              </div>
              <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl">
                <Phone className="w-4 h-4 text-green-500 flex-shrink-0" />
                <span className="text-sm text-gray-700">{user.phone}</span>
              </div>
              {user.age && (
                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl">
                  <Activity className="w-4 h-4 text-purple-500 flex-shrink-0" />
                  <span className="text-sm text-gray-700">{user.age} years</span>
                </div>
              )}
              {user.location && (
                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl">
                  <MapPin className="w-4 h-4 text-orange-500 flex-shrink-0" />
                  <span className="text-sm text-gray-700 truncate">{user.location}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Stats Cards - Responsive */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl p-4 shadow-md hover:shadow-lg transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Appointments</p>
                <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
              </div>
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Calendar className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-md hover:shadow-lg transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Confirmed</p>
                <p className="text-2xl font-bold text-green-600">{stats.confirmed}</p>
              </div>
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-md hover:shadow-lg transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Completed</p>
                <p className="text-2xl font-bold text-purple-600">{stats.completed}</p>
              </div>
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                <Award className="w-5 h-5 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 rounded-xl p-4 border border-red-200 animate-in slide-in-from-top-2 duration-200">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Appointments Section */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-gray-100 flex flex-wrap justify-between items-center gap-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800 flex items-center gap-2">
                <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                My Appointments
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Total: {appointments.length} appointment{appointments.length !== 1 ? "s" : ""}
              </p>
            </div>
            <button
              onClick={() => navigate("/book-appointment")}
              className="group px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all duration-300 flex items-center gap-2 text-sm"
            >
              <Plus className="w-4 h-4 group-hover:rotate-90 transition" />
              New Appointment
            </button>
          </div>

          {loading ? (
            <div className="p-12 text-center">
              <div className="inline-block animate-spin text-4xl mb-4">⏳</div>
              <p className="text-gray-500">Loading appointments...</p>
            </div>
          ) : appointments.length === 0 ? (
            <div className="p-8 sm:p-12 text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-10 h-10 text-gray-400" />
              </div>
              <p className="text-gray-500 text-lg font-medium">No appointments booked yet</p>
              <p className="text-sm text-gray-400 mt-2">
                Start your journey to better healthcare by booking your first appointment.
              </p>
              <button
                onClick={() => navigate("/book-appointment")}
                className="mt-6 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all duration-300"
              >
                Book Your First Appointment
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {appointments.map((appointment) => {
                const statusInfo = getStatusBadge(appointment.status);
                return (
                  <div key={appointment.id} className="p-4 sm:p-6 hover:bg-gray-50 transition-all duration-300">
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                      <div className="flex-1 w-full">
                        <div className="flex flex-wrap items-center gap-2 mb-3">
                          <div className="flex items-center gap-2">
                            <Hospital className="w-5 h-5 text-blue-600" />
                            <h3 className="text-base sm:text-lg font-bold text-gray-800">
                              {appointment.hospitalId?.hospitalName || "Hospital"}
                            </h3>
                          </div>
                          <div className={`flex items-center gap-1 px-2 py-1 ${statusInfo.color} text-white text-xs rounded-full`}>
                            {statusInfo.icon}
                            <span>{statusInfo.text}</span>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                          <div className="flex items-center gap-2">
                            <Stethoscope className="w-4 h-4 text-blue-500 flex-shrink-0" />
                            <div className="min-w-0">
                              <p className="text-xs text-gray-500">SPECIALTY</p>
                              <p className="font-semibold text-sm truncate">{appointment.doctorSpecialty || "General"}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-green-500 flex-shrink-0" />
                            <div>
                              <p className="text-xs text-gray-500">DATE</p>
                              <p className="font-semibold text-sm">{appointment.date}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-purple-500 flex-shrink-0" />
                            <div>
                              <p className="text-xs text-gray-500">TIME</p>
                              <p className="font-bold text-lg text-indigo-600">{appointment.time}</p>
                            </div>
                          </div>
                        </div>

                        {appointment.hospitalId && (
                          <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                            <MapPin className="w-4 h-4 flex-shrink-0" />
                            <span className="truncate">{appointment.hospitalId.location}, {appointment.hospitalId.city}</span>
                          </div>
                        )}

                        {appointment.notes && (
                          <div className="mt-3 p-3 bg-gray-50 rounded-xl">
                            <div className="flex items-center gap-2 mb-1">
                              <FileText className="w-4 h-4 text-gray-500" />
                              <p className="text-xs text-gray-500 font-semibold">NOTES</p>
                            </div>
                            <p className="text-sm text-gray-700 break-words">{appointment.notes}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 justify-end mt-4 pt-4 border-t">
                      <button
                        onClick={() => setRescheduleId(appointment.id)}
                        disabled={appointment.status === "cancelled" || appointment.status === "completed"}
                        className="group px-3 py-1.5 sm:px-4 sm:py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-xl transition-all duration-300 font-semibold text-xs sm:text-sm flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105"
                      >
                        <Edit2 className="w-3 h-3 sm:w-4 sm:h-4" />
                        Reschedule
                      </button>
                      <button
                        onClick={() => handleCancel(appointment.id)}
                        disabled={cancelLoading === appointment.id || appointment.status === "cancelled" || appointment.status === "completed"}
                        className="group px-3 py-1.5 sm:px-4 sm:py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl transition-all duration-300 font-semibold text-xs sm:text-sm flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105"
                      >
                        {cancelLoading === appointment.id ? (
                          <>
                            <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            <span className="hidden sm:inline">Canceling...</span>
                          </>
                        ) : (
                          <>
                            <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                            Cancel
                          </>
                        )}
                      </button>
                      
                      {appointment.status === "completed" && !appointment.hasReview && (
                        <button
                          onClick={() => handleReviewClick(appointment)}
                          className="group px-3 py-1.5 sm:px-4 sm:py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-xl transition-all duration-300 font-semibold text-xs sm:text-sm flex items-center gap-1 hover:scale-105"
                        >
                          <Star className="w-3 h-3 sm:w-4 sm:h-4" />
                          Write Review
                        </button>
                      )}
                      
                      {appointment.status === "completed" && appointment.hasReview && (
                        <div className="px-3 py-1.5 sm:px-4 sm:py-2 bg-green-100 text-green-700 rounded-xl font-semibold text-xs sm:text-sm flex items-center gap-1">
                          <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                          Reviewed
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Health Tip */}
        <div className="mt-8 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-100">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
              <Heart className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-green-800">Health Tip</p>
              <p className="text-xs text-green-700 mt-1">
                Regular health check-ups can help detect potential issues early. 
                Book your next appointment today and stay healthy!
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Reschedule Modal */}
      {rescheduleId && (
        <RescheduleModal
          appointmentId={rescheduleId}
          onClose={() => setRescheduleId(null)}
          onReschedule={handleReschedule}
        />
      )}

      {/* Review Modal */}
      {showReviewModal && selectedAppointment && (
        <ReviewModal
          appointment={selectedAppointment}
          hospitalId={selectedAppointment.hospitalId?._id || selectedAppointment.hospitalId}
          onClose={() => {
            setShowReviewModal(false);
            setSelectedAppointment(null);
          }}
          onReviewSubmitted={handleReviewSubmitted}
        />
      )}
    </div>
  );
}