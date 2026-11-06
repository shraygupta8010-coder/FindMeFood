// src/services/userService.js
import api from './api';

export const userService = {
  // Get user profile
  getProfile: async () => {
    try {
      const response = await api.get('/user/profile');  // REMOVE /api from here
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Update user profile
  updateProfile: async (profileData) => {
    try {
      const response = await api.put('/user/profile', profileData);  // REMOVE /api from here
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Change password
  changePassword: async (passwordData) => {
    try {
      const response = await api.put('/user/change-password', passwordData);  // REMOVE /api from here
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};