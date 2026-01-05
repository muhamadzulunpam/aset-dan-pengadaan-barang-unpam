// src/App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import AuthInitializer from "./components/auth/AuthInitializer";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import GuestRoute from "./components/auth/GuestRoute";
import SignIn from "./components/pages/login/SignIn";
import Dashboard from "./components/pages/dashboard/Dashboard";
import Pengadaan from "./components/pages/pengadaan/Pengadaan";
import CreatePengadaan from "./components/pages/pengadaan/Create";
import UpdatePengadaan from "./components/pages/pengadaan/Update";
import "./index.css";

function App() {
  return (
    <Router>
      <AuthInitializer>
        <div className="App">
          <Routes>
            {/* Public Routes */}
            <Route 
              path="/signin" 
              element={
                <GuestRoute>
                  <SignIn />
                </GuestRoute>
              } 
            />

            {/* Protected Routes */}
            <Route 
              path="/" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/pengadaan" 
              element={
                <ProtectedRoute>
                  <Pengadaan />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/pengadaan/create" 
              element={
                <ProtectedRoute>
                  <CreatePengadaan />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/pengadaan/update/:id" 
              element={
                <ProtectedRoute>
                  <UpdatePengadaan />
                </ProtectedRoute>
              } 
            />

            {/* Fallback route */}
            <Route path="*" element={<div>404 - Page Not Found</div>} />
          </Routes>
        </div>
      </AuthInitializer>
    </Router>
  );
}

export default App;