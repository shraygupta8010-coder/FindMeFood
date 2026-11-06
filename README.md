# 🍽️❤️ FindMeFood - Food Donation Platform

> **Connecting surplus food with hungry hearts through technology and compassion**

A full-stack web application that bridges the gap between food donors and verified NGOs, reducing food waste while fighting hunger.

[![Node.js](https://img.shields.io/badge/Node.js-v18+-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18.2-blue.svg)](https://reactjs.org/)
[![Express](https://img.shields.io/badge/Express-5.1-lightgrey.svg)](https://expressjs.com/)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

## 🌟 Features

### For Donors 👥
- ✅ **Easy Registration** with OTP verification
- 📸 **AI-Powered Food Verification** - Upload photos, AI verifies food quality
- 📍 **Find Nearby NGOs** - Real-time geolocation to find closest NGOs
- 📊 **Track Donations** - Monitor your donation history and impact
- 🆔 **Aadhaar Verification** - Optional identity verification for trust

### For NGOs 🏢
- 🎯 **View Available Donations** - Real-time donation listings
- ✅ **Accept & Track** - Update donation status through the journey
- 📈 **Dashboard** - Track accepted donations and statistics
- 📍 **Location-Based** - Receive donations from nearby areas

### Admin Features 🛡️
- 👤 **User Management** - Aadhaar verification approval
- 📞 **Contact Support** - Handle user queries and support tickets
- 🔍 **System Monitoring** - Database health and debugging tools

## 🚀 Tech Stack

### Backend
- **Node.js** + **Express.js** - RESTful API
- **SQLite** - Lightweight database (easy to migrate to PostgreSQL)
- **JWT** - Authentication & authorization
- **Bcrypt** - Password hashing
- **Multer** - File upload handling
- **Nodemailer** - Email OTP service

### Frontend
- **React 18** - Modern UI library
- **Vite** - Fast build tool
- **TailwindCSS** - Utility-first CSS
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **Leaflet** - Interactive maps

### AI & Services
- **Hugging Face API** - AI food verification
- **Google Cloud Vision** - Backup AI service
- **Cloudinary** - Image storage (optional)
- **Geolocation API** - Real-time location services

## 📁 Project Structure

```
find-me-food/
├── donation-app-backend/        # Backend API
│   ├── config/                  # Database configuration
│   ├── controllers/             # Business logic
│   ├── middleware/              # Auth & validation
│   ├── models/                  # Data models
│   ├── routes/                  # API routes
│   ├── services/                # External services
│   ├── scripts/                 # Utility scripts
│   └── server.js               # Entry point
│
└── findmefood-frontend/         # Frontend React app
    ├── src/
    │   ├── components/          # Reusable components
    │   ├── pages/              # Page components
    │   ├── context/            # React Context
    │   ├── hooks/              # Custom hooks
    │   └── service/            # API services
    └── vite.config.js          # Vite configuration
```

## 🛠️ Installation & Setup

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Git

### 1. Clone the Repository

```bash
git clone https://github.com/shrayguptaa8fl8/FindMeFood.git
cd FindMeFood
```

### 2. Backend Setup

```bash
cd donation-app-backend
npm install

# Create .env file
cp .env.example .env
# Edit .env with your credentials

# Initialize database (run once)
node scripts/setupDatabase.js

# Start backend server
npm start
```

Backend will run on: `http://localhost:5000`

### 3. Frontend Setup

```bash
cd findmefood-frontend
npm install

# Start development server
npm run dev
```

Frontend will run on: `http://localhost:3000`

## ⚙️ Environment Variables

### Backend (.env)

```env
# Server
PORT=5000
JWT_SECRET=your_super_secret_jwt_key

# Database
DB_PATH=./donation_app.db

# Email (for OTP)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-gmail-app-password
EMAIL_SERVICE=gmail

# AI Verification
HUGGINGFACE_API_KEY=your_huggingface_key
GOOGLE_APPLICATION_CREDENTIALS=./path-to-credentials.json

# Image Storage (Optional)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Frontend URL
CLIENT_URL=http://localhost:3000
FRONTEND_URL=http://localhost:3000
```

## 📊 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/verify-otp` - Verify OTP
- `POST /api/auth/login` - User login
- `POST /api/auth/resend-otp` - Resend OTP

### Donations
- `POST /api/donations` - Create donation
- `GET /api/donations` - Get all donations
- `GET /api/donations/my-donations` - Get user's donations
- `PUT /api/donations/:id/status` - Update donation status
- `POST /api/donations/verify-food` - AI food verification

### NGOs
- `POST /api/ngo/register` - NGO registration
- `GET /api/ngo/all` - Get all NGOs
- `GET /api/ngo/nearby` - Find nearby NGOs
- `GET /api/ngo/donations` - Get NGO donations

### User Profile
- `GET /api/user/profile` - Get user profile
- `PUT /api/user/profile` - Update user profile

### Aadhaar Verification
- `POST /api/aadhaar/upload` - Upload Aadhaar
- `GET /api/aadhaar/status` - Check verification status
- `POST /api/aadhaar/verify` - Admin: Verify Aadhaar

## 🧪 Testing

```bash
# Backend tests (when implemented)
cd donation-app-backend
npm test

# Frontend tests (when implemented)
cd findmefood-frontend
npm test
```

## 📦 Deployment

### Backend (Railway/Render/Heroku)

```bash
# Build command
npm install

# Start command
npm start
```

### Frontend (Vercel/Netlify)

```bash
# Build command
npm run build

# Output directory
dist/
```

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Team

- **Shray Gupta** - [@shrayguptaa8fl8](https://github.com/shrayguptaa8fl8)

## 🙏 Acknowledgments

- Food donors and NGOs making a real difference
- Open source community for amazing tools
- Everyone fighting food waste and hunger

## 📞 Support

For support, email support@findmefood.org or open an issue on GitHub.

---

<div align="center">

**Made with ❤️ for a hunger-free world**

[Website](https://findmefood.vercel.app) • [Report Bug](https://github.com/shrayguptaa8fl8/FindMeFood/issues) • [Request Feature](https://github.com/shrayguptaa8fl8/FindMeFood/issues)

</div>
