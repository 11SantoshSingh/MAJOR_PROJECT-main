import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { 
  Calendar, Clock, User, Mail, Phone, 
  CheckCircle, XCircle, RefreshCw, Filter,
  TrendingUp, AlertCircle, Hospital, 
  Stethoscope, FileText, LogOut, 
  ChevronRight, Star, Activity, Users
} from "lucide-react";

export default function HospitalAppointmentsPage() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const navigate = useNavigate();
  
  const doctor = (() => {
    try {
      const doc = JSON.parse(localStorage.getItem("doctor"));
      return doc;
    } catch (e) {
      return null;
    }
  })();

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("token");
      
      if (!token) {
        setError("No authentication token found. Please login again.");
        setLoading(false);
        return;
      }
      
      if (!doctor) {
        setError("Hospital data not found. Please login again.");
        setLoading(false);
        return;
      }
      
      const response = await axios.get("http://localhost:5001/api/appointments/hospital", {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setAppointments(response.data.appointments || []);
    } catch (err) {
      console.error("Error fetching appointments:", err);
      setError(err.response?.data?.error || "Failed to fetch appointments");
    } finally {
      setLoading(false);
    }
  };

  const markAsCompleted = async (appointmentId) => {
    if (!window.confirm("Mark this appointment as completed? Patient will be able to leave a review.")) {
      return;
    }
    
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      await axios.put(
        `http://localhost:5001/api/appointments/${appointmentId}/complete`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccess("Appointment marked as completed!");
      await fetchAppointments();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to mark as completed");
      setTimeout(() => setError(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  const cancelAppointment = async (appointmentId) => {
    if (!window.confirm("Are you sure you want to cancel this appointment?")) {
      return;
    }
    
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:5001/api/appointments/${appointmentId}/cancel`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess("Appointment cancelled!");
      await fetchAppointments();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to cancel appointment");
      setTimeout(() => setError(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (doctor && (doctor.id || doctor._id)) {
      fetchAppointments();
    } else {
      setLoading(false);
      setError("Please login as a hospital to view appointments.");
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userType");
    localStorage.removeItem("doctor");
    navigate("/doctor-register");
  };

  if (!doctor || (!doctor.id && !doctor._id)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-2xl p-8 text-center max-w-md animate-in fade-in zoom-in duration-300">
          <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Hospital className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Access Denied</h2>
          <p className="text-gray-600 mb-6">Please login as a hospital to view appointments.</p>
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

  const getStatusBadge = (status) => {
    switch (status) {
      case "confirmed":
        return { color: "bg-green-500", icon: <CheckCircle className="w-3 h-3" />, text: "Confirmed" };
      case "rescheduled":
        return { color: "bg-orange-500", icon: <RefreshCw className="w-3 h-3" />, text: "Rescheduled" };
      case "completed":
        return { color: "bg-purple-500", icon: <CheckCircle className="w-3 h-3" />, text: "Completed" };
      case "cancelled":
        return { color: "bg-red-500", icon: <XCircle className="w-3 h-3" />, text: "Cancelled" };
      default:
        return { color: "bg-gray-500", icon: <Activity className="w-3 h-3" />, text: status };
    }
  };

  const canMarkAsCompleted = (status) => {
    return status === "confirmed" || status === "rescheduled";
  };

  const canCancel = (status) => {
    return status === "confirmed" || status === "rescheduled";
  };

  const filteredAppointments = appointments.filter(apt => {
    if (filterStatus === "all") return true;
    return apt.status === filterStatus;
  });

  const stats = {
    total: appointments.length,
    confirmed: appointments.filter(a => a.status === "confirmed").length,
    rescheduled: appointments.filter(a => a.status === "rescheduled").length,
    completed: appointments.filter(a => a.status === "completed").length,
    cancelled: appointments.filter(a => a.status === "cancelled").length,
  };

  const hospitalId = doctor.id || doctor._id;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 via-blue-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex justify-between items-center">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Hospital className="w-5 h-5 text-white/80" />
                <span className="text-white/80 text-sm font-medium">Hospital Dashboard</span>
              </div>
              <h1 className="text-3xl font-bold">Appointment Management</h1>
              <p className="text-white/70 mt-1">Manage patient appointments and track their status</p>
            </div>
            <button
              onClick={handleLogout}
              className="group flex items-center gap-2 px-4 py-2 bg-white/20 rounded-xl hover:bg-white/30 transition-all duration-300"
            >
              <LogOut className="w-4 h-4 transition-transform group-hover:rotate-12" />
              <span>Logout</span>
            </button>
          </div>
          <div className="mt-4 flex items-center gap-2 text-sm text-white/70">
            <Hospital className="w-4 h-4" />
            <span>{doctor.hospitalName}</span>
            <span className="w-1 h-1 bg-white/50 rounded-full"></span>
            <span>ID: {hospitalId}</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Statistics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-white rounded-xl p-5 shadow-md hover:shadow-lg transition-all duration-300 group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total</p>
                <p className="text-3xl font-bold text-gray-800">{stats.total}</p>
              </div>
              <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center group-hover:scale-110 transition">
                <Activity className="w-6 h-6 text-indigo-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-5 shadow-md hover:shadow-lg transition-all duration-300 group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Confirmed</p>
                <p className="text-3xl font-bold text-green-600">{stats.confirmed}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center group-hover:scale-110 transition">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-5 shadow-md hover:shadow-lg transition-all duration-300 group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Rescheduled</p>
                <p className="text-3xl font-bold text-orange-600">{stats.rescheduled}</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center group-hover:scale-110 transition">
                <RefreshCw className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-5 shadow-md hover:shadow-lg transition-all duration-300 group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Completed</p>
                <p className="text-3xl font-bold text-purple-600">{stats.completed}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center group-hover:scale-110 transition">
                <Star className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-5 shadow-md hover:shadow-lg transition-all duration-300 group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Cancelled</p>
                <p className="text-3xl font-bold text-red-600">{stats.cancelled}</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center group-hover:scale-110 transition">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setFilterStatus("all")}
            className={`px-5 py-2.5 rounded-xl font-semibold transition-all duration-300 flex items-center gap-2 ${
              filterStatus === "all"
                ? "bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-md"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            <Filter className="w-4 h-4" />
            All ({stats.total})
          </button>
          <button
            onClick={() => setFilterStatus("confirmed")}
            className={`px-5 py-2.5 rounded-xl font-semibold transition-all duration-300 ${
              filterStatus === "confirmed"
                ? "bg-green-600 text-white shadow-md"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Confirmed ({stats.confirmed})
          </button>
          <button
            onClick={() => setFilterStatus("rescheduled")}
            className={`px-5 py-2.5 rounded-xl font-semibold transition-all duration-300 ${
              filterStatus === "rescheduled"
                ? "bg-orange-600 text-white shadow-md"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Rescheduled ({stats.rescheduled})
          </button>
          <button
            onClick={() => setFilterStatus("completed")}
            className={`px-5 py-2.5 rounded-xl font-semibold transition-all duration-300 ${
              filterStatus === "completed"
                ? "bg-purple-600 text-white shadow-md"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Completed ({stats.completed})
          </button>
          <button
            onClick={() => setFilterStatus("cancelled")}
            className={`px-5 py-2.5 rounded-xl font-semibold transition-all duration-300 ${
              filterStatus === "cancelled"
                ? "bg-red-600 text-white shadow-md"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Cancelled ({stats.cancelled})
          </button>
        </div>

        {/* Error & Success Messages */}
        {error && (
          <div className="mb-6 bg-red-50 rounded-xl p-4 border border-red-200 animate-in slide-in-from-top-2 duration-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <p className="text-red-700">{error}</p>
              </div>
              <button 
                onClick={fetchAppointments}
                className="px-3 py-1 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 transition"
              >
                Retry
              </button>
            </div>
          </div>
        )}
        
        {success && (
          <div className="mb-6 bg-green-50 rounded-xl p-4 border border-green-200 animate-in slide-in-from-top-2 duration-200">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <p className="text-green-700">{success}</p>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="bg-white rounded-xl p-12 text-center">
            <div className="inline-block animate-spin text-4xl mb-4">⏳</div>
            <p className="text-gray-500">Loading appointments...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && filteredAppointments.length === 0 && (
          <div className="bg-white rounded-xl p-12 text-center">
            <div className="w-24 h-24 bg-gradient-to-br from-indigo-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-12 h-12 text-indigo-400" />
            </div>
            <p className="text-gray-500 text-lg">No appointments found</p>
            <p className="text-sm text-gray-400 mt-2">
              When patients book appointments with your hospital, they will appear here.
            </p>
            <button
              onClick={() => navigate("/")}
              className="mt-6 px-6 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all duration-300"
            >
              Go to Home
            </button>
          </div>
        )}

        {/* Appointments List */}
        {!loading && !error && filteredAppointments.length > 0 && (
          <div className="space-y-4">
            {filteredAppointments.map((apt) => {
              const statusInfo = getStatusBadge(apt.status);
              return (
                <div key={apt._id} className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden">
                  <div className="p-6">
                    <div className="flex flex-wrap justify-between items-start gap-4 mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2 flex-wrap">
                          <div className="flex items-center gap-2">
                            <User className="w-5 h-5 text-gray-500" />
                            <h3 className="text-xl font-bold text-gray-800">
                              {apt.patientId?.name || "Patient"}
                            </h3>
                          </div>
                          <div className={`flex items-center gap-1 px-2 py-1 ${statusInfo.color} text-white text-xs rounded-full`}>
                            {statusInfo.icon}
                            <span>{statusInfo.text}</span>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                          <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-600">{apt.patientId?.email}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-600">{apt.patientId?.phone || "No phone"}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right bg-gradient-to-r from-indigo-50 to-blue-50 px-4 py-2 rounded-xl">
                        <div className="flex items-center gap-1 text-indigo-600">
                          <Calendar className="w-4 h-4" />
                          <p className="text-lg font-semibold">{apt.date}</p>
                        </div>
                        <div className="flex items-center gap-1 text-indigo-600 mt-1">
                          <Clock className="w-4 h-4" />
                          <p className="text-2xl font-bold">{apt.time}</p>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4 pt-4 border-t">
                      <div className="flex items-center gap-2">
                        <Stethoscope className="w-4 h-4 text-blue-500" />
                        <div>
                          <p className="text-xs text-gray-500">SPECIALTY</p>
                          <p className="font-semibold">{apt.doctorSpecialty || "General"}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-purple-500" />
                        <div>
                          <p className="text-xs text-gray-500">BOOKED ON</p>
                          <p className="text-sm">{new Date(apt.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </div>

                    {apt.notes && (
                      <div className="mb-4 p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl">
                        <div className="flex items-center gap-2 mb-1">
                          <FileText className="w-4 h-4 text-gray-500" />
                          <p className="text-xs text-gray-500 font-semibold">PATIENT NOTES</p>
                        </div>
                        <p className="text-sm text-gray-700">{apt.notes}</p>
                      </div>
                    )}

                    <div className="flex gap-3 justify-end flex-wrap pt-4 border-t">
                      {canMarkAsCompleted(apt.status) && (
                        <button
                          onClick={() => markAsCompleted(apt._id)}
                          className="group px-5 py-2.5 bg-purple-500 hover:bg-purple-600 text-white rounded-xl transition-all duration-300 font-semibold flex items-center gap-2 hover:shadow-lg hover:scale-105"
                        >
                          <CheckCircle className="w-4 h-4 group-hover:rotate-12 transition" />
                          Mark as Completed
                        </button>
                      )}
                      {canCancel(apt.status) && (
                        <button
                          onClick={() => cancelAppointment(apt._id)}
                          className="group px-5 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl transition-all duration-300 font-semibold flex items-center gap-2 hover:shadow-lg hover:scale-105"
                        >
                          <XCircle className="w-4 h-4 group-hover:rotate-12 transition" />
                          Cancel
                        </button>
                      )}
                      {apt.status === "completed" && (
                        <div className="px-5 py-2.5 bg-green-100 text-green-700 rounded-xl font-semibold flex items-center gap-2">
                          <Star className="w-4 h-4" />
                          Patient can now review
                        </div>
                      )}
                      {apt.status === "cancelled" && (
                        <div className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-semibold flex items-center gap-2">
                          <XCircle className="w-4 h-4" />
                          Cancelled
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Info Footer */}
        <div className="mt-8 p-5 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-blue-800">Workflow Guide</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2 text-xs text-blue-700">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                  <span>Patient books → "Confirmed"</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-orange-500 rounded-full"></div>
                  <span>Patient reschedules → "Rescheduled"</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-purple-500 rounded-full"></div>
                  <span>After appointment → Click "Mark as Completed"</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
                  <span>Patient can then write a review</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}