import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { 
  Menu, X, Home, Calendar, User, LogOut, 
  Hospital, Settings, Stethoscope, Heart, 
  FileText, ClipboardList, Activity, Brain,
  Sparkles, Shield, Star, Phone, Mail, MapPin
} from "lucide-react";

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("user"));
    } catch (e) {
      return null;
    }
  });
  const [doctor, setDoctor] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("doctor"));
    } catch (e) {
      return null;
    }
  });

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleStorageChange = () => {
      try {
        setUser(JSON.parse(localStorage.getItem("user")));
        setDoctor(JSON.parse(localStorage.getItem("doctor")));
      } catch (e) {
        setUser(null);
        setDoctor(null);
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userType");
    localStorage.removeItem("user");
    localStorage.removeItem("doctor");
    setUser(null);
    setDoctor(null);
    navigate("/");
    setMobileMenuOpen(false);
  };

  const isActive = (path) => location.pathname === path;

  const navLinkClass = (path) => `
    relative font-medium transition-all duration-300 py-2 px-3 rounded-xl
    ${isActive(path) 
      ? "text-blue-600 bg-blue-50" 
      : "text-gray-600 hover:text-blue-600 hover:bg-gray-50"
    }
  `;

  const isHospital = doctor !== null;
  const isPatient = user !== null;

  return (
    <>
      {/* Spacer to prevent content from going under fixed navbar */}
      <div className="h-16"></div>
      
      <nav className={`
        fixed top-0 left-0 right-0 z-50 transition-all duration-300
        ${scrolled 
          ? "bg-white/95 backdrop-blur-md shadow-lg" 
          : "bg-white shadow-md"
        }
      `}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link 
              to="/" 
              className="flex items-center gap-2 group transition-transform duration-300 hover:scale-105"
            >
              <div className="relative">
                <span className="text-2xl">🏥</span>
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full animate-ping"></div>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                MediCare
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-1">
              {/* Home/Upload - Always visible */}
              <Link to="/" className={navLinkClass("/")}>
                <div className="flex items-center gap-2">
                  <Brain className="w-4 h-4" />
                  <span>AI Diagnosis</span>
                </div>
              </Link>

              {isPatient ? (
                <>
                  <Link to="/book-appointment" className={navLinkClass("/book-appointment")}>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>Book</span>
                    </div>
                  </Link>
                  <Link to="/profile" className={navLinkClass("/profile")}>
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      <span className="max-w-24 truncate">{user.name}</span>
                    </div>
                  </Link>
                  <button
                    onClick={logout}
                    className="flex items-center gap-2 px-4 py-2 ml-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl font-medium text-sm transition-all duration-300 hover:shadow-lg hover:shadow-red-500/25 hover:scale-105"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </button>
                </>
              ) : isHospital ? (
                <>
                  <Link to="/hospital-appointments" className={navLinkClass("/hospital-appointments")}>
                    <div className="flex items-center gap-2">
                      <ClipboardList className="w-4 h-4" />
                      <span>Appointments</span>
                    </div>
                  </Link>
                  <Link to="/doctor-profile" className={navLinkClass("/doctor-profile")}>
                    <div className="flex items-center gap-2">
                      <Settings className="w-4 h-4" />
                      <span>Profile</span>
                    </div>
                  </Link>
                  <button
                    onClick={logout}
                    className="flex items-center gap-2 px-4 py-2 ml-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl font-medium text-sm transition-all duration-300 hover:shadow-lg hover:shadow-red-500/25 hover:scale-105"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </button>
                </>
              ) : (
                <div className="flex items-center gap-2 ml-2">
                  <Link
                    to="/register"
                    className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-medium text-sm transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/25 hover:scale-105 flex items-center gap-2"
                  >
                    <Heart className="w-4 h-4" />
                    <span>Patient</span>
                  </Link>
                  <Link
                    to="/doctor-register"
                    className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-xl font-medium text-sm transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/25 hover:scale-105 flex items-center gap-2"
                  >
                    <Hospital className="w-4 h-4" />
                    <span>Hospital</span>
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl hover:bg-gray-100 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6 text-gray-600" />
              ) : (
                <Menu className="w-6 h-6 text-gray-600" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className={`
          md:hidden fixed inset-x-0 bg-white/95 backdrop-blur-md shadow-lg
          transition-all duration-300 ease-in-out transform
          ${mobileMenuOpen ? "top-16 opacity-100 visible" : "-top-full opacity-0 invisible"}
        `}>
          <div className="px-4 pt-4 pb-6 space-y-2 max-h-[calc(100vh-4rem)] overflow-y-auto">
            <Link 
              to="/" 
              className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-200 font-medium"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Brain className="w-5 h-5 text-blue-600" />
              <span>AI Diagnosis</span>
            </Link>

            {isPatient ? (
              <>
                <Link 
                  to="/book-appointment" 
                  className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-200 font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Calendar className="w-5 h-5 text-green-600" />
                  <span>Book Appointment</span>
                </Link>
                <Link 
                  to="/profile" 
                  className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-200 font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <User className="w-5 h-5 text-purple-600" />
                  <span>My Profile</span>
                </Link>
                <button 
                  onClick={logout} 
                  className="w-full flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl font-medium transition-all duration-200"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Logout</span>
                </button>
              </>
            ) : isHospital ? (
              <>
                <Link 
                  to="/hospital-appointments" 
                  className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-200 font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <ClipboardList className="w-5 h-5 text-blue-600" />
                  <span>Appointments</span>
                </Link>
                <Link 
                  to="/doctor-profile" 
                  className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-200 font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Settings className="w-5 h-5 text-gray-600" />
                  <span>Profile</span>
                </Link>
                <button 
                  onClick={logout} 
                  className="w-full flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl font-medium transition-all duration-200"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <div className="space-y-2 pt-2">
                <Link
                  to="/register"
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-semibold transition-all duration-300"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Heart className="w-5 h-5" />
                  <span>Patient Register/Login</span>
                </Link>
                <Link
                  to="/doctor-register"
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-xl font-semibold transition-all duration-300"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Hospital className="w-5 h-5" />
                  <span>Hospital Register/Login</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      </nav>
    </>
  );
}