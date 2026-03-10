import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";

// Page Imports
import Home from "../pages/Home";
import Login from "../pages/Login";
import Register from "../pages/Register";
import Admin from "../pages/Admin";
import AdminLogin from "../pages/AdminLogin";
import ReportIssue from "../pages/ReportIssue";
import MapView from "../pages/MapView";
import TrackComplaint from "../pages/TrackComplaint";
import Success from "../pages/Success";

function AppRoutes() {
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem("js_user") || "null"));
  const [admin, setAdmin] = useState(() => JSON.parse(localStorage.getItem("js_admin") || "null"));
  const location = useLocation();

  // Scroll to top on every route change to prevent "dead" inputs
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);

  useEffect(() => {
    const syncStorage = () => {
      setUser(JSON.parse(localStorage.getItem("js_user") || "null"));
      setAdmin(JSON.parse(localStorage.getItem("js_admin") || "null"));
    };
    window.addEventListener("storage", syncStorage);
    return () => window.removeEventListener("storage", syncStorage);
  }, []);

  const handleAdminLogin = (adminData) => {
    setAdmin(adminData);
  };

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/register" element={<Register />} />
      <Route path="/map" element={<MapView />} />
      
      <Route 
        path="/login" 
        element={<Login onLoginSuccess={(data) => setUser(data)} />} 
      />
      
      <Route
        path="/report"
        element={user ? <ReportIssue /> : <Navigate to="/login" replace />}
      />
      
      <Route 
        path="/track" 
        element={user ? <TrackComplaint /> : <Navigate to="/login" replace />} 
      />

      <Route 
        path="/admin" 
        element={admin ? <Admin /> : <AdminLogin onAdminLogin={handleAdminLogin} />} 
      />

      <Route path="/success/:id" element={<Success />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default AppRoutes;
