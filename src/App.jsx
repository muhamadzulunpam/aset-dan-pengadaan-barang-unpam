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
import ViewPengadaan from "./components/pages/pengadaan/View";
import Assets from "./components/pages/assets/Index";
import CreateAssets from "./components/pages/assets/Create";
import UpdateAssets from "./components/pages/assets/Update";
import ViewAssets from "./components/pages/assets/View";
import MaintenanceAssets from "./components/pages/maintenance_assets/Index";
// import UpdateMaintenanceAssets from "./components/pages/maintenance_assets/Update";
// import ViewMaintenanceAssets from "./components/pages/maintenance_assets/View";
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
            {/* route pengadaan awal*/}
            <Route 
              path="/procurements" 
              element={
                <ProtectedRoute>
                  <Pengadaan />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/procurements/create" 
              element={
                <ProtectedRoute>
                  <CreatePengadaan />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/procurements/update/:id" 
              element={
                <ProtectedRoute>
                  <UpdatePengadaan />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/procurements/view/:id" 
              element={
                <ProtectedRoute>
                  <ViewPengadaan />
                </ProtectedRoute>
              } 
            />
            {/* route pengadaan akhir*/}
            
            {/* route assets awal*/}
            <Route 
              path="/assets" 
              element={
                <ProtectedRoute>
                  <Assets />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/assets/create" 
              element={
                <ProtectedRoute>
                  <CreateAssets />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/assets/update/:code" 
              element={
                <ProtectedRoute>
                  <UpdateAssets />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/assets/view/:code" 
              element={
                <ProtectedRoute>
                  <ViewAssets />
                </ProtectedRoute>
              } 
            />
            {/* route assets akhir*/}

            {/* route maintenance assets awal*/}
            <Route 
              path="/maintenance-assets" 
              element={
                <ProtectedRoute>
                  <MaintenanceAssets />
                </ProtectedRoute>
              } 
            />
            {/* <Route 
              path="/maintenance-assets/update/:code" 
              element={
                <ProtectedRoute>
                  <UpdateMaintenanceAssets />
                </ProtectedRoute>
              } 
            /> */}
            {/* <Route 
              path="/maintenance-assets/view/:code" 
              element={
                <ProtectedRoute>
                  <ViewMaintenanceAssets />
                </ProtectedRoute>
              } 
            /> */}
            {/* route maintenance assets akhir*/}


            {/* Fallback route */}
            <Route path="*" element={<div>404 - Page Not Found</div>} />
          </Routes>
        </div>
      </AuthInitializer>
    </Router>
  );
}

export default App;