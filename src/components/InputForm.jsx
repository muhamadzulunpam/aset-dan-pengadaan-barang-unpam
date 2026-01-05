// src/components/InputForm.js
import React, { useState } from 'react';
import { Save, Plus, Upload, User, Mail, Shield } from 'lucide-react';

const InputForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: '',
    status: 'active',
    avatar: null
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    // Reset form
    setFormData({
      name: '',
      email: '',
      role: '',
      status: 'active',
      avatar: null
    });
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 p-6 shadow-sm hover-lift">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-slate-900">Add Team Member</h2>
        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
          <User className="w-5 h-5 text-white" />
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Avatar Upload */}
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-slate-200 rounded-2xl flex items-center justify-center border-2 border-dashed border-slate-300">
            <Upload className="w-6 h-6 text-slate-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-900">Profile Photo</p>
            <p className="text-sm text-slate-500">JPG, PNG up to 2MB</p>
          </div>
        </div>

        {/* Name Field */}
        <div className="space-y-2">
          <label className="flex items-center text-sm font-medium text-slate-700">
            <User className="w-4 h-4 mr-2" />
            Full Name
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all duration-300"
            placeholder="Enter full name"
            required
          />
        </div>

        {/* Email Field */}
        <div className="space-y-2">
          <label className="flex items-center text-sm font-medium text-slate-700">
            <Mail className="w-4 h-4 mr-2" />
            Email Address
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all duration-300"
            placeholder="Enter email address"
            required
          />
        </div>

        {/* Role Field */}
        <div className="space-y-2">
          <label className="flex items-center text-sm font-medium text-slate-700">
            <Shield className="w-4 h-4 mr-2" />
            Role
          </label>
          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all duration-300 appearance-none"
            required
          >
            <option value="">Select a role</option>
            <option value="admin">Administrator</option>
            <option value="user">User</option>
            <option value="editor">Editor</option>
            <option value="viewer">Viewer</option>
          </select>
        </div>

        {/* Status Field */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-slate-700">Status</label>
          <div className="flex space-x-4">
            <label className="flex items-center">
              <input
                type="radio"
                name="status"
                value="active"
                checked={formData.status === 'active'}
                onChange={handleChange}
                className="text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-slate-700">Active</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="status"
                value="inactive"
                checked={formData.status === 'inactive'}
                onChange={handleChange}
                className="text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-slate-700">Inactive</span>
            </label>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex space-x-3 pt-4">
          <button
            type="submit"
            className="flex-1 flex items-center justify-center px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300 transform hover:scale-[1.02]"
          >
            <Save className="w-4 h-4 mr-2" />
            Save Member
          </button>
          
          <button
            type="button"
            className="flex items-center px-6 py-3 border border-slate-300 text-slate-700 rounded-xl font-semibold hover:bg-slate-50 transition-all duration-300"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Another
          </button>
        </div>
      </form>
    </div>
  );
};

export default InputForm;