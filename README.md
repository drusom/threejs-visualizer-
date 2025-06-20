# 🏢 Rebel Visualizer - 3D Warehouse Unit Visualization

A modern, interactive 3D warehouse visualization built with React, Three.js, and secure Google Sheets integration. Perfect for real estate, storage facilities, and warehouse management.

![3D Warehouse Visualization](https://img.shields.io/badge/3D-Three.js-orange)
![React](https://img.shields.io/badge/Frontend-React-blue)
![Google Cloud](https://img.shields.io/badge/Deploy-Google%20Cloud-green)
![Security](https://img.shields.io/badge/Security-Secret%20Manager-red)

## ✨ Features

🎮 **Interactive 3D Environment**
- Smooth camera controls with right-click panning and zoom
- Click any unit for detailed information
- Smart camera reset with smooth animations
- Responsive design for desktop and mobile

📊 **Real-time Data Integration**
- Live Google Sheets integration via secure API
- Automatic availability status updates
- Color-coded units (Green = Available, Red = Occupied)
- Fallback data when offline

🔒 **Enterprise Security**
- Google Cloud Secret Manager for API keys
- No secrets stored in code
- Service account authentication
- HTTPS-only deployment

🚀 **Production Ready**
- Docker containerization
- Google Cloud Run deployment
- Auto-scaling and load balancing
- Health checks and monitoring

## 🎯 Quick Start

### Local Development

```bash
# Clone the repository
git clone https://github.com/drusom/Rebel_visualizer-.git
cd Rebel_visualizer-

# Navigate to project directory
cd project

# Install dependencies
npm install

# Start development server
npm run dev
```

Your app will be available at `http://localhost:5173`

### Local Network Access

The development server is configured to be accessible on your local network:
- **Your computer**: `http://localhost:5173`
- **Other devices**: `http://[your-ip]:5173`

## 🏗️ Architecture

```
📱 React Frontend (Three.js)
    ↓ API calls
🛡️ Express.js API Server
    ↓ Secure authentication
☁️ Google Cloud Secret Manager
    ↓ Credentials
📊 Google Sheets API
```

### Key Components

- **Frontend**: React + Three.js for 3D visualization
- **Backend**: Express.js API for secure data fetching
- **Data**: Google Sheets with real-time updates
- **Security**: Google Cloud Secret Manager
- **Deployment**: Docker + Google Cloud Run

## 📋 Google Sheets Setup

Your Google Sheet should have these columns (Row 1):

| Product | Available | Size | Amenities |
|---------|-----------|------|-----------|
| a1      | TRUE      | 1,200 sq ft | Standard package |
| a2      | FALSE     | 1,200 sq ft | Standard package |
| b1      | TRUE      | 1,500 sq ft | Premium package |

### Supported Column Names

- **Unit identifier**: `Product`, `Unit Name`, `Building ID`, `Building`, `Unit`, `Name`
- **Availability**: `Available`, `Availability`, `Status`
- **Size**: `Size`, `Square Feet`, `Sq Ft`
- **Amenities**: `Amenities`, `Features`, `Package`

### Availability Formats

- ✅ Available: `TRUE`, `Yes`, `Available`, `1`
- ❌ Occupied: `FALSE`, `No`, `Occupied`, `0`

## 🚀 Deployment to Google Cloud

Follow our comprehensive [Deployment Guide](project/DEPLOYMENT.md) for step-by-step instructions.

### Quick Deploy Commands

```bash
# Set up Google Cloud project
export PROJECT_ID="your-project-id"
gcloud config set project $PROJECT_ID

# Enable APIs
gcloud services enable run.googleapis.com cloudbuild.googleapis.com secretmanager.googleapis.com sheets.googleapis.com

# Deploy with Cloud Build
gcloud builds submit --config project/cloudbuild.yaml
```

## 🎮 Camera Controls

- **Left Click + Drag**: Rotate camera around the scene
- **Right Click + Drag**: Pan the camera and change focal point
- **Scroll Wheel**: Zoom in/out
- **Click Unit**: Reset camera to overview with smooth animation

## 🛠️ Development

### Project Structure

```
project/
├── src/
│   ├── components/        # React components
│   │   ├── UnitWarehouse.tsx
│   │   └── UnitDetailPopup.tsx
│   ├── hooks/             # Custom React hooks
│   │   └── useSecureUnitData.ts
│   ├── types/             # TypeScript definitions
│   └── utils/             # Utility functions
├── api/                   # Backend API server
│   ├── index.js          # Express server
│   └── package.json      # Backend dependencies
├── public/                # Static assets
│   ├── models/           # 3D models
│   └── textures/         # Textures
└── Dockerfile            # Container configuration
```

### Adding New Units

1. **Add to 3D Model**: Update `UnitWarehouse.tsx` with new unit geometry
2. **Update Google Sheet**: Add unit data to your Google Sheet
3. **Test**: The unit will automatically appear with live data

### Customizing Appearance

- **Colors**: Edit `UnitWarehouse.tsx` material colors
- **Models**: Replace files in `public/models/`
- **Textures**: Add new textures to `public/textures/`

## 🔧 API Endpoints

### `/api/unit-data`
Fetches live unit data from Google Sheets

**Response:**
```json
{
  "success": true,
  "data": {
    "a1": {
      "name": "a1",
      "size": "1,200 sq ft",
      "availability": "Available",
      "amenities": "Standard package"
    }
  },
  "lastUpdated": "2024-01-15T10:30:00.000Z"
}
```

### `/api/health`
Health check endpoint for monitoring

## 🔍 Troubleshooting

### Common Issues

1. **Units not updating**: Check Google Sheets permissions
2. **3D models not loading**: Verify file paths in `public/models/`
3. **API errors**: Check Google Cloud logs and Secret Manager

### Debug Mode

```javascript
// Enable debug logging in browser console
localStorage.setItem('debug', 'true');
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- 📧 **Issues**: [GitHub Issues](https://github.com/drusom/Rebel_visualizer-/issues)
- 📖 **Documentation**: [Deployment Guide](project/DEPLOYMENT.md)
- ☁️ **Google Cloud**: [Cloud Run Documentation](https://cloud.google.com/run/docs)

---

**Built with ❤️ using React, Three.js, and Google Cloud** 