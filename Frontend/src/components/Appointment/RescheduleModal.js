import React, { useState } from "react";
import { Calendar, Clock, X, Check, AlertCircle, CalendarDays } from "lucide-react";

export default function RescheduleModal({ appointmentId, onClose, onReschedule }) {
  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const timeSlots = [
    "09:00", "09:30", "10:00", "10:30", "11:00",
    "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00",
  ];

  const today = new Date().toISOString().split("T")[0];
  const maxDate = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!newDate || !newTime) {
      setError("Please select both date and time");
      return;
    }

    try {
      setLoading(true);
      await onReschedule(appointmentId, newDate, newTime);
    } catch (err) {
      setError(err.message || "Failed to reschedule appointment");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden transform transition-all duration-300 scale-100 animate-in slide-in-from-bottom-10">
        
        {/* Gradient Header */}
        <div className="relative bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 px-6 py-8">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12"></div>
          
          <div className="relative z-10">
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <CalendarDays className="w-6 h-6 text-white" />
                  <span className="text-white/80 text-sm font-medium">Reschedule Request</span>
                </div>
                <h2 className="text-2xl font-bold text-white">Change Appointment</h2>
                <p className="text-white/70 text-sm mt-1">Select a new date and time for your appointment</p>
              </div>
              <button
                onClick={onClose}
                className="text-white/70 hover:text-white transition-colors p-1 rounded-full hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Date Selection */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <Calendar className="w-4 h-4 text-blue-600" />
              Select New Date
            </label>
            <div className="relative">
              <input
                type="date"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                min={today}
                max={maxDate}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all duration-200 bg-gray-50/50 hover:bg-white"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                <Calendar className="w-5 h-5" />
              </div>
            </div>
            {newDate && (
              <p className="text-xs text-green-600 font-medium mt-1">
                📅 {formatDate(newDate)}
              </p>
            )}
          </div>

          {/* Time Selection */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <Clock className="w-4 h-4 text-indigo-600" />
              Select New Time
            </label>
            <div className="grid grid-cols-4 gap-2">
              {timeSlots.map((slot) => {
                const isSelected = newTime === slot;
                return (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => setNewTime(slot)}
                    className={`py-2.5 px-2 rounded-xl font-medium transition-all duration-200 text-sm
                      ${isSelected 
                        ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25 scale-105" 
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-105 border border-gray-200"
                      }`}
                  >
                    {slot}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selected Summary Card */}
          {newDate && newTime && (
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                  <Check className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-green-700 font-medium">Selected Appointment</p>
                  <p className="text-sm font-semibold text-green-800">
                    {formatDate(newDate)} at {newTime}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 rounded-xl p-4 border border-red-200 animate-in slide-in-from-top-2 duration-200">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                <p className="text-red-700 text-sm font-medium">{error}</p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 py-3 px-4 rounded-xl font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-all duration-200 border border-gray-200 disabled:opacity-50 hover:scale-[1.02]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !newDate || !newTime}
              className={`flex-1 py-3 px-4 rounded-xl font-semibold text-white transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed ${
                loading || !newDate || !newTime
                  ? "bg-gray-400"
                  : "bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 hover:scale-[1.02]"
              }`}
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Updating...</span>
                </div>
              ) : (
                "Confirm Reschedule"
              )}
            </button>
          </div>
        </form>

        {/* Info Footer */}
        <div className="bg-blue-50/50 px-6 py-4 border-t border-blue-100">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-blue-600 text-sm">💡</span>
            </div>
            <div>
              <p className="text-xs text-blue-800 font-medium">Reschedule Policy</p>
              <p className="text-xs text-blue-600 mt-0.5">
                You can reschedule your appointment up to 60 days in advance. Changes are free of charge.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}