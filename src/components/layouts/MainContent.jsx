// src/components/MainContent.js
import React from "react";
import StatsCards from "../StatsCards";
import DataTable from "../DataTable";
import { useLocation } from "react-router-dom";
import InputForm from "../InputForm";

const MainContent = () => {
  const location = useLocation();

  // Fungsi untuk mendapatkan judul dan deskripsi berdasarkan route
  const getPageContent = () => {
    const path = location.pathname;

    if (path === "/" || path === "/dashboard") {
      return {
        title: "Ringkasan Dashboard",
        description:
          "Selamat datang kembali! Berikut adalah aktivitas terbaru tim pengadaan Anda hari ini.",

        showStats: true,
        showForm: true,
        showTable: true,
      };
    }

    if (path === "/pengadaan") {
      return {
        title: "Manajemen Pengadaan",
        description:
          "Kelola semua proses pengadaan dan pembelian barang perusahaan.",
        showStats: true,
        showForm: false,
        showTable: true,
      };
    }

    if (path === "/settings") {
      return {
        title: "Pengaturan Sistem",
        description:
          "Kelola pengaturan sistem pengadaan dan preferensi akun Anda.",
        showStats: false,
        showForm: false,
        showTable: false,
      };
    }

    // Fallback untuk route lainnya
    return {
      title: "Dashboard",
      description: "Welcome to the procurement dashboard.",
      showStats: true,
      showForm: true,
      showTable: true,
    };
  };

  const pageContent = getPageContent();

  return (
    <main className="flex-1 overflow-y-auto p-6 bg-gradient-to-br from-slate-50 via-white to-cyan-50/30">
      <div className="max-w-7xl mx-auto">
        {/* Dynamic Page Title */}
        <div className="mb-8 animate-fade-in">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            {pageContent.title}
          </h1>
          <p className="text-slate-600 text-lg">{pageContent.description}</p>
        </div>

        {/* Conditional Rendering berdasarkan route */}
        {pageContent.showStats && <StatsCards />}

        {/* Form and Activity Section - hanya di dashboard */}
        {pageContent.showForm && (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mt-8">
            <InputForm />

            {/* Recent Activity */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 p-6 shadow-sm hover-lift">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-slate-900">
                  Aktivitas Terbaru
                </h2>
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold text-sm">12</span>
                </div>
              </div>

              <div className="space-y-4">
                {[
                  {
                    action: "Pengadaan baru dibuat",
                    time: "2 menit lalu",
                    user: "Sarah Johnson",
                    type: "pengadaan_baru",
                    avatar: "SJ",
                  },
                  {
                    action: "Pembayaran diterima",
                    time: "5 menit lalu",
                    user: "Mike Thompson",
                    type: "pembayaran",
                    avatar: "MT",
                  },
                  {
                    action: "Proyek selesai",
                    time: "10 menit lalu",
                    user: "Tim Design",
                    type: "proyek",
                    avatar: "TD",
                  },
                  {
                    action: "Pengaturan diperbarui",
                    time: "15 menit lalu",
                    user: "System Admin",
                    type: "pengaturan",
                    avatar: "SA",
                  },
                ].map((activity, index) => (
                  <div
                    key={index}
                    className="flex items-center space-x-4 p-3 rounded-xl hover:bg-slate-50/50 transition-all duration-300 group"
                  >
                    <div className="w-10 h-10 bg-gradient-to-r from-slate-600 to-slate-700 rounded-xl flex items-center justify-center text-white text-sm font-semibold">
                      {activity.avatar}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-900">
                        {activity.action}
                      </p>
                      <p className="text-xs text-slate-500">
                        oleh {activity.user}
                      </p>
                    </div>
                    <span className="text-xs text-slate-400 group-hover:text-slate-600 transition-colors">
                      {activity.time}
                    </span>
                  </div>
                ))}
              </div>

              <button className="w-full mt-6 py-3 text-slate-600 hover:text-slate-800 font-medium rounded-xl border border-dashed border-slate-300 hover:border-slate-400 transition-all duration-300">
                Lihat Semua Aktivitas
              </button>
            </div>
          </div>
        )}

        {/* Data Table - conditional rendering */}
        {pageContent.showTable && (
          <div className="mt-8 animate-fade-in">
            <DataTable />
          </div>
        )}
      </div>
    </main>
  );
};

export default MainContent;
