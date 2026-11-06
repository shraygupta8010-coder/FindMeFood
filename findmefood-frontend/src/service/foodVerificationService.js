// src/service/foodVerificationService.js
import api from './api';

export const foodVerificationService = {
  // Verify food image
  async verifyFoodImage(imageFile) {
    try {
      const formData = new FormData();
      formData.append('image', imageFile);

      const response = await api.post('/donations/verify-food', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return response.data;
    } catch (error) {
      console.error('Food verification error:', error);
      throw error;
    }
  },

  // Verify multiple food images (uses first image for verification)
  async verifyMultipleFoodImages(imageFiles) {
    try {
      if (imageFiles.length === 0) {
        throw new Error('No images provided');
      }

      const result = await this.verifyFoodImage(imageFiles[0]);
      return result.data.verification;
    } catch (error) {
      console.error('Multiple images verification error:', error);
      throw error;
    }
  }
};

export default foodVerificationService;