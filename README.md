# CarbonFlow - Carbon Capture Innovations Marketplace

**Live Application:** [carbonflow.net](https://carbonflow.net)

CarbonFlow is a cutting-edge AI-powered platform that connects carbon capture technology producers with industrial consumers, facilitating sustainable partnerships through intelligent matching and comprehensive impact analysis.

## Features

### **Core Functionality**
- **AI-Powered Matching**: Advanced algorithms analyze producer capabilities and consumer needs
- **Interactive Dashboard**: Real-time visualization of carbon capture opportunities
- **Impact Analysis**: Comprehensive environmental and economic impact reporting
- **Geospatial Mapping**: Location-based matching with distance calculations
- **Smart Caching**: Session-based report caching for improved user experience

### **Authentication & Security**
- **JWT-based Authentication**: Secure user registration and login
- **Role-based Access**: Producer and consumer user types
- **Session Management**: Persistent login with secure token handling

### **Analytics & Reporting**
- **Partnership Impact Reports**: Detailed analysis of carbon reduction potential
- **Financial Modeling**: Cost-benefit analysis with ROI calculations
- **Logistics Planning**: Transportation and infrastructure considerations
- **Watchlist Management**: Save and track potential partnerships

### **User Experience**
- **Responsive Design**: Optimized for desktop, tablet, and mobile
- **Viewport-Locked Dashboard**: Immersive full-screen experience
- **Progressive Web App**: Fast loading with offline capabilities
- **Intuitive Navigation**: Clean, modern interface design

## 🛠️ Tech Stack

### **Frontend**
- **React 18** - Modern UI framework with hooks
- **Vite** - Fast build tool and development server
- **Leaflet** - Interactive mapping and geolocation
- **CSS3** - Custom styling with responsive design
- **Vercel** - Production deployment and hosting

### **Backend**
- **Python Flask** - Lightweight web framework
- **Azure OpenAI** - AI-powered analysis and matching
- **Geopy** - Geographic calculations and geocoding
- **JWT** - Authentication and authorization
- **bcrypt** - Password hashing and security
- **Railway** - Production deployment and hosting

### **Database**
- **JSON-based Storage** - Lightweight data persistence
- **Session Storage** - Client-side caching
- **Local Storage** - User preferences and watchlists

## 🏗️ Architecture

### **Frontend Architecture**
```
frontend/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── MapView.jsx      # Interactive Leaflet map
│   │   ├── Sidebar.jsx      # Analysis results panel
│   │   ├── ProducerList.jsx # Producer selection interface
│   │   └── ImpactModal.jsx  # Report visualization
│   ├── pages/               # Route-based page components
│   │   ├── HomePage.jsx     # Main dashboard
│   │   ├── LandingPage.jsx  # Marketing landing page
│   │   └── AnalyticsPage.jsx # Analytics dashboard
│   ├── utils/               # Utility functions
│   │   ├── auth.js          # Authentication helpers
│   │   └── reportCache.js   # Session caching system
│   └── api.js               # API communication layer
```

### **Backend Architecture**
```
backend/
├── app.py                   # Main Flask application
├── auth.py                  # Authentication logic
├── database.json            # Data storage
└── requirements.txt         # Python dependencies
```

## 🌐 Deployment

### **Production URLs**
https://carbonflow.net


### **Infrastructure**
- **Frontend Hosting**: Vercel with automatic deployments
- **Backend Hosting**: Railway with continuous deployment
- **CDN**: Vercel Edge Network for global distribution
- **SSL**: Automatic HTTPS with Let's Encrypt
- **SPA Routing**: Configured for client-side routing

## Getting Started

### **Prerequisites**
- Node.js 18+ and npm
- Python 3.9+ and pip
- Git

### **Frontend Setup**
```bash
# Clone the repository
git clone https://github.com/yourusername/CarbonCapture-Innovations-Marketplace.git
cd CarbonCapture-Innovations-Marketplace/frontend

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

### **Backend Setup**
```bash
# Navigate to backend directory
cd backend

# Install Python dependencies
pip install -r requirements.txt

# Set environment variables
export AZURE_OPENAI_ENDPOINT="your-endpoint"
export AZURE_OPENAI_API_KEY="your-api-key"

# Run development server
python app.py
```

### **Environment Variables**
Create a `.env` file in the backend directory (copy from `env.example`):
```env
# Required for AI features
AZURE_OPENAI_ENDPOINT=https://your-resource-name.openai.azure.com/
AZURE_OPENAI_API_KEY=your-api-key-here
AZURE_OPENAI_DEPLOYMENT_NAME=gpt-4

# Required for authentication
JWT_SECRET_KEY=your-secure-jwt-secret-key

# Optional
FLASK_ENV=development
ENVIRONMENT=development
```

**⚠️ Security Note**: API keys are securely stored as environment variables and never committed to the repository.

## 📡 API Endpoints

### **Authentication**
- `POST /api/register` - User registration
- `POST /api/login` - User authentication
- `GET /api/profile` - Get user profile (protected)

### **Data & Matching**
- `GET /api/producers` - List all producers
- `GET /api/consumers` - List all consumers
- `POST /api/matches` - Find potential matches
- `POST /api/analyze-matches` - AI-powered analysis

### **Impact Analysis**
- `POST /api/impact-report` - Generate partnership impact report
- `GET /api/analytics` - Get analytics data

## 🔐 Security Features

- **Environment-Based Secrets**: API keys stored securely as environment variables
- **JWT Authentication**: Secure token-based user authentication  
- **Password Hashing**: bcrypt for secure password storage
- **Repository Security**: No sensitive data committed to Git
- **Production Secret Management**: Secure deployment with Railway/Vercel
- **CORS Protection**: Configured for production security
- **Input Validation**: Comprehensive server-side validation

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**Built with ❤️ for a sustainable future** 🌱
