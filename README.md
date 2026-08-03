# 🔬 Dissectra

> **AI-Powered Product Dissection & 3D Inspection Platform**

Dissectra is an AI-powered mobile application that allows users to inspect real-world products by capturing multiple images. The application analyzes the object using Artificial Intelligence, identifies its internal components, predicts materials and manufacturing information, and prepares the data for interactive 3D visualization.

The long-term vision of Dissectra is to become an educational and engineering platform where users can virtually disassemble products and explore their internal construction.

---

## ✨ Features

### 📷 Multi-Angle Image Capture

- Capture multiple images of an object
- Automatic inspection creation
- Organized inspection history

### 🤖 AI Analysis

- Product identification
- Component detection
- Material prediction
- Manufacturing process prediction
- Assembly method prediction
- Replaceability prediction
- Confidence scoring

### 📁 Inspection Management

- Local inspection storage
- Inspection history
- Thumbnail generation
- Metadata management

### 🎨 Modern UI

- Light & Dark mode
- Dynamic accent colors
- Responsive interface
- Theme persistence

### ⚡ Backend Pipeline

- Modular inspection pipeline
- AI analysis engine
- Model generation pipeline
- REST API architecture
- Backend auto-discovery (Development)

---

# 🏗 Architecture

```
React Native App
        │
        ▼
Node.js Backend (Express)
        │
        ▼
Inspection Pipeline
        │
        ▼
Gemini AI
        │
        ▼
Structured Analysis
        │
        ▼
3D Model Pipeline
```

---

# 🛠 Tech Stack

## Mobile

- React Native
- TypeScript
- React Navigation
- React Native FS
- AsyncStorage

## Backend

- Node.js
- Express.js
- Multer
- Pipeline Architecture
- REST API

## Artificial Intelligence

- Google Gemini
- OpenAI Compatible APIs
- OpenRouter (Supported)

## Storage

- Local Storage (Current)
- Cloud Storage (Planned)

---

# 📂 Project Structure

```
backend/
│
├── config/
├── controllers/
├── middleware/
├── pipeline/
├── routes/
├── services/
├── storage/
├── utils/
└── server.js

mobile/
│
├── src/
│   ├── screens/
│   ├── components/
│   ├── navigation/
│   ├── services/
│   ├── storage/
│   ├── theme/
│   └── utils/
```

---

# 🚀 Getting Started

## Clone Repository

```bash
git clone https://github.com/monishbgowda/dissectra.git

cd dissectra
```

---

## Install Dependencies

### Mobile

```bash
npm install
```

### Backend

```bash
cd backend
npm install
```

---

## Configure Environment

Create a `.env` file inside the backend directory.

Example:

```env
PORT=4000

UPLOAD_ROOT=./storage

AI_ANALYSIS_PROVIDER=gemini

GEMINI_API_KEY=YOUR_API_KEY
```

---

## Start Backend

```bash
cd backend
npm start
```

---

## Start React Native

```bash
npm start

npm run android
```

---

# 📱 Current Workflow

```
Capture Images

        ↓

Create Inspection

        ↓

Upload Images

        ↓

AI Analysis

        ↓

Generate Structured Data

        ↓

Display Results
```

---

# 🧠 Analysis Output

Dissectra currently predicts:

- Product Name
- Brand
- Model
- Category
- Components
- Material
- Manufacturing Process
- Assembly Method
- Replaceability
- Confidence Score

---

# 🌐 Deployment Roadmap

Current Status

- ✅ React Native Application
- ✅ Backend API
- ✅ AI Analysis Pipeline
- ✅ Inspection History
- ✅ Theme System
- ✅ Backend Auto Discovery (Development)

Upcoming

- Cloud Backend Deployment
- Cloud Image Storage
- User Authentication
- Interactive 3D Viewer
- Exploded View
- Mechanical AI Integration
- Real-time Model Generation

---

# 📸 Screenshots

> Screenshots will be added after the first stable release.

---

# 📈 Future Scope

Dissectra aims to become an engineering and educational platform capable of:

- Virtual Product Dissection
- Interactive 3D Learning
- Manufacturing Education
- Reverse Engineering Assistance
- Material Intelligence
- Mechanical AI Assistant

---

# 🤝 Contributing

Contributions are welcome.

Feel free to open issues or submit pull requests for improvements.

---

# 📄 License

This project is licensed under the MIT License.

---

# 👨‍💻 Author

**Monish B Gowda**

Information Science Engineering Student

GitHub: https://github.com/monishbgowda

---

⭐ If you found this project interesting, consider giving it a star!
