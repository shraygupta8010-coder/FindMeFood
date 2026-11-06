// src/service/contactService.js
import api from './api';

export const contactService = {
  // Submit contact form
  submitContact: async (contactData) => {
    try {
      const response = await api.post('/api/contact', contactData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get support tickets (for future use)
  getSupportTickets: async () => {
    try {
      const response = await api.get('/api/contact/tickets');
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export default contactService;