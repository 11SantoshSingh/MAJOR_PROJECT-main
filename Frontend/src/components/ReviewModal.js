import React, { useState } from "react";
import axios from "axios";
import { Star, X, Send, AlertCircle, CheckCircle, Calendar, Clock, Hospital, User } from "lucide-react";

export default function ReviewModal({ appointment, hospitalId, onClose, onReviewSubmitted }) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [hoveredStar, setHoveredStar] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!comment.trim()) {
      setError("Please write a review comment");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem("token");
      await axios.post(
        "http://localhost:5001/api/reviews",
        {
          hospitalId,
          appointmentId: appointment._id,
          rating,
          comment
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      onReviewSubmitted();
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to submit review");
    } finally {
      setLoading(false);
    }
  };

  const ratingMessages = {
    5: { text: "Excellent! Outstanding service!", icon: "🤩", color: "from-yellow-500 to-amber-500" },
    4: { text: "Very Good! Great experience!", icon: "😊", color: "from-lime-500 to-green-500" },
    3: { text: "Good! Satisfactory service.", icon: "🙂", color: "from-blue-500 to-cyan-500" },
    2: { text: "Fair! Needs improvement.", icon: "😐", color: "from-orange-500 to-amber-500" },
    1: { text: "Poor! Very dissatisfied.", icon: "😞", color: "from-red-500 to-rose-500" }
  };

  const currentRatingMsg = ratingMessages[rating];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden transform transition-all duration-300 scale-100 animate-in slide-in-from-bottom-10">
        
        {/* Gradient Header */}
        <div className="relative bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 px-6 py-6">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12"></div>
          
          <div className="relative z-10">
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                  <span className="text-white/80 text-sm font-medium">Share Your Feedback</span>
                </div>
                <h2 className="text-2xl font-bold text-white">Rate Your Experience</h2>
                <p className="text-white/70 text-sm mt-1">Your feedback helps us improve</p>
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
          {/* Appointment Info Card */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                <Hospital className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-blue-600 font-medium">Hospital</p>
                <p className="font-semibold text-gray-800">{appointment.hospitalId?.hospitalName || "Hospital"}</p>
                <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    <span>{appointment.date}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{appointment.time}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Rating Section */}
          <div className="text-center">
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              How would you rate your experience?
            </label>
            
            {/* Stars */}
            <div className="flex justify-center gap-2 mb-3">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredStar(star)}
                  onMouseLeave={() => setHoveredStar(0)}
                  className="focus:outline-none transform transition-all duration-200 hover:scale-110"
                >
                  <Star
                    size={40}
                    className={`transition-all duration-200 ${
                      star <= (hoveredStar || rating)
                        ? "fill-yellow-400 text-yellow-400 drop-shadow-lg"
                        : "text-gray-300 hover:text-yellow-200"
                    }`}
                  />
                </button>
              ))}
            </div>
            
            {/* Rating Message */}
            <div className={`inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r ${currentRatingMsg.color} rounded-full text-white text-sm font-medium shadow-lg`}>
              <span className="text-lg">{currentRatingMsg.icon}</span>
              <span>{currentRatingMsg.text}</span>
            </div>
          </div>

          {/* Comment Section */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Share your experience *
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows="4"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 transition-all duration-200 resize-none bg-gray-50/50 hover:bg-white"
              placeholder="Tell us about your experience... What did you like? What could be improved?"
              required
            />
            <p className="text-xs text-gray-400 mt-1">
              {comment.length}/500 characters
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 rounded-xl p-3 border border-red-200 animate-in slide-in-from-top-2 duration-200">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
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
              disabled={loading}
              className="flex-1 py-3 px-4 rounded-xl font-semibold text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Submit Review</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Footer Info */}
        <div className="bg-gradient-to-r from-amber-50 to-yellow-50 px-6 py-3 border-t border-amber-100">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xs">⭐</span>
            </div>
            <p className="text-xs text-amber-700">
              Your review helps other patients make informed decisions. Thank you for sharing!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}