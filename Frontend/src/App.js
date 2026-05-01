import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import UploadPage from "./pages/UploadPage";
import RegisterPage from "./pages/RegisterPage";
import DoctorRegisterPage from "./pages/DoctorRegisterPage";
import BookAppointmentPage from "./pages/BookAppointmentPage";
import ProfilePage from "./pages/ProfilePage";
import DoctorProfilePage from "./pages/DoctorProfilePage";
import HospitalAppointmentsPage from "./pages/HospitalAppointmentsPage";
import "./App.css";

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<UploadPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/doctor-register" element={<DoctorRegisterPage />} />
        <Route path="/book-appointment" element={<BookAppointmentPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/doctor-profile" element={<DoctorProfilePage />} />
        <Route path="/hospital-appointments" element={<HospitalAppointmentsPage />} />
      </Routes>
    </Router>
  );
}

export default App;