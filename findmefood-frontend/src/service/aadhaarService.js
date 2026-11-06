// src/service/aadhaarService.js
import api from './api';

export const aadhaarService = {
  // Upload Aadhaar card images
  async uploadAadhaarImages(aadhaarNumber, frontImage, backImage) {
    try {
      console.log('📸 Uploading Aadhaar images...');
      
      const formData = new FormData();
      formData.append('aadhaar_number', aadhaarNumber);
      formData.append('front', frontImage);
      formData.append('back', backImage);

      const response = await api.post('/aadhaar/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      console.log('✅ Aadhaar upload successful:', response.data);
      return response.data;

    } catch (error) {
      console.error('❌ Aadhaar upload failed:', error);
      throw error;
    }
  },

  // Get Aadhaar verification status
  async getAadhaarStatus() {
    try {
      const response = await api.get('/aadhaar/status');
      return response.data;
    } catch (error) {
      console.error('Get Aadhaar status failed:', error);
      throw error;
    }
  },

  // Verify Aadhaar (Admin only)
  async verifyAadhaar(userId, status, rejectionReason = '') {
    try {
      const response = await api.post(`/aadhaar/verify/${userId}`, {
        status,
        rejection_reason: rejectionReason
      });
      return response.data;
    } catch (error) {
      console.error('Aadhaar verification failed:', error);
      throw error;
    }
  },

  // Get pending Aadhaar verifications
  async getPendingVerifications() {
    try {
      const response = await api.get('/aadhaar/pending');
      return response.data;
    } catch (error) {
      console.error('Get pending verifications failed:', error);
      throw error;
    }
  }
};