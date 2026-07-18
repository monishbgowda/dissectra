# Dissectra - 3D Product Dissection App
## Project Presentation

---

## 1. Project Overview

**Dissectra** is a React Native Android application that allows users to:
- Capture product images using the camera
- Analyze them using AI (Google Gemini)
- View interactive 3D models with component breakdowns
- Inspect individual parts (material, function, category)

**Current Status**: Demo Mode - 3D model viewer with mock data

---

## 2. What Was Built

### Core Features Implemented

| Feature | Status | Description |
|---------|--------|-------------|
| Model Viewer | ✅ Working | Animated emoji placeholders with rotation & pulse |
| Model Selector | ✅ Working | Switch between Duck 🦆, Box 📦, Avocado 🥑 |
| Inspector Panel | ✅ Working | Shows component details (name, material, function) |
| Camera Capture | ⚠️ Skipped | Code exists but bypassed for demo |
| AI Analysis | ⚠️ Backend | Gemini integration ready but not in demo flow |
| CNN Model | ✅ Created | Python model for product classification (external) |
| Real 3D Models | ❌ Pending | @react-three/fiber native compatibility issue |

---

## 3. Tech Stack

```
Frontend:
├── React Native 0.85.2
├── @react-three/fiber (3D rendering)
├── @react-three/drei (3D helpers)
├── react-native-image-picker (camera)
├── react-native-fs (file operations)
└── react-native-vision-camera (alternative camera)

Backend/AI:
├── Google Gemini API (image analysis)
├── Python CNN Model (MobileNetV2)
└── ONNX Export (mobile deployment ready)

Build:
├── Gradle 9.3.1
├── Android SDK 35
├── JDK 17
└── Metro Bundler
```

---

## 4. App Architecture

```
App.js (Entry Point)
├── Model Selector (Duck/Box/Avocado)
├── ModelViewer.js (3D Display)
│   ├── Animated rotation
│   ├── Inspector Panel
│   └── Component details
├── CameraCapture.js (Skipped in demo)
│   ├── Permission handling
│   ├── Photo capture
│   └── Base64 conversion
├── Base64Converter.js
├── GeminiAnalyser.js (Mock/fallback)
└── ModelRetrival.js (Mock/fallback)
```

---

## 5. Demo Models Available

### Duck
- **Components**: Beak (Navigation, Ceramic), Wings (Lift, Feathers), Tail (Stability, Feathers)
- **Model**: Khronos glTF Sample
- **URL**: `Duck.glb`

### Box
- **Components**: Face (Surface, Cardboard), Edge (Support, Cardboard)
- **Model**: Simple geometry demo
- **URL**: `Box.glb`

### Avocado
- **Components**: Skin (Protection, Organic), Seed (Core, Stone)
- **Model**: Organic shape demo
- **URL**: `Avocado.glb`

---

## 6. User Interface

### Current Screens

**Main Screen (3D Viewer)**
- Dark theme (`#121212` background)
- Top selector bar with model pills
- Center: Rotating 3D model (140px animated box)
- Tap to pause/resume rotation
- Bottom: Inspector panel with component details

**Model Selector**
- Horizontal scrollable pills
- Active model highlighted in cyan (`#5ddcff`)
- Shows model description below

**Inspector Panel**
- Component name
- Function description
- Material type
- Category tag

---

## 7. CNN Model (External)

Created in `cnn_model/` directory:

### Architecture
- **Backbone**: MobileNetV2 (pretrained)
- **Input**: 224×224 RGB images
- **Output 1**: Product class (10 categories)
- **Output 2**: Component detection (5 types)

### Product Categories
Duck, Box, Avocado, Chair, Phone, Bottle, Car, Watch, Laptop, Shoe

### Files
- `product_classifier.py` - Model code
- `requirements.txt` - Dependencies
- `README.md` - Usage guide

---

## 8. What Works vs What's Pending

### ✅ Working Now
1. App launches directly to 3D viewer
2. Model switching (Duck/Box/Avocado)
3. Smooth rotation animation
4. Component inspector panel
5. Dark theme UI
6. WiFi ADB deployment
7. Release APK builds successfully

### ⚠️ Partially Working
1. Camera module (code ready, bypassed)
2. AI analysis (mock responses)
3. 3D model loading (shows animated placeholder)

### ❌ Not Implemented
1. Real 3D model file loading (GLB/GLTF)
2. Live camera capture flow
3. Backend model retrieval API
4. CNN integration into React Native
5. Component highlighting in 3D view

---

## 9. Build & Deploy

### Commands Used
```bash
# Build release APK
$env:JAVA_HOME = "C:\Program Files\Java\jdk-17"
cd android
.\gradlew.bat assembleRelease

# Install via USB
adb -s <DEVICE_ID> install -r app\build\outputs\apk\release\app-release.apk

# Or via WiFi
adb connect <PHONE_IP>:5555
adb -s <PHONE_IP>:5555 install -r app-release.apk
```

### Build Stats
- Build time: ~2 minutes
- APK size: ~25MB
- Gradle tasks: 367 (321 cached)

---

## 10. Challenges Faced

| Challenge | Solution |
|-----------|----------|
| Camera API issues (undefined is not a function) | Switched to react-native-image-picker |
| Hooks order crash | Moved useCallback before conditional returns |
| WiFi ADB disconnections | Reconnect using `adb tcpip 5555` |
| Android SDK 35 missing | Used USB device instead |
| 3D model not rendering | Showing animated placeholder instead |

---

## 11. Future Roadmap

### Phase 2 (Next Steps)
1. Fix GLB model loading in ModelViewer
2. Integrate CNN model via ONNX Runtime Mobile
3. Re-enable camera with working capture
4. Add real-time component highlighting

### Phase 3 (Advanced)
1. AR overlay using ARCore
2. Voice-guided disassembly instructions
3. Community model sharing
4. Offline AI processing

---

## 12. Project Structure

```
dissectra/
├── App.js                          # Main entry (demo mode)
├── src/
│   ├── modules/
│   │   ├── CameraCapture.js        # Camera (skipped)
│   │   ├── ModelViewer.js          # 3D display
│   │   ├── InspectorPanel.js       # Component details
│   │   ├── Base64Converter.js      # Image conversion
│   │   ├── GeminiAnalyser.js       # AI analysis
│   │   └── ModelRetrival.js        # 3D model fetch
│   └── components/                 # (if any)
├── cnn_model/                      # Python CNN (external)
│   ├── product_classifier.py
│   ├── requirements.txt
│   └── README.md
├── android/                        # Android build files
├── PRESENTATION.md                 # This file
└── README.md                       # Project readme
```

---

## 13. Demo Script

### For Presentation

1. **Launch App**
   - Dark-themed UI appears
   - Gold circle with 🦆 duck emoji rotating

2. **Show Model Selector**
   - Tap **Box** → Blue circle with 📦 appears
   - Tap **Avocado** → Green circle with 🥑 appears
   - Each model has unique color and emoji

3. **Show Animations**
   - Rotation: 360° continuous spin
   - Pulse: Breathing scale effect
   - Tap to pause/resume

4. **Show Inspector Panel**
   - Component name (e.g., "Beak")
   - Function (e.g., "Navigation")
   - Material (e.g., "Ceramic")
   - Category (e.g., "Feature")

5. **Mention Backend**
   - CNN model created (Python/MobileNetV2)
   - Ready for mobile deployment via ONNX
   - 10 product categories supported

6. **Explain Limitations**
   - Real 3D GLB models pending (library compatibility)
   - Camera flow disabled for demo stability
   - AI pipeline ready but not connected

---

## 14. Key Takeaways

✅ **Working app** with animated model placeholders
✅ **Model switching** between Duck 🦆, Box 📦, Avocado 🥑
✅ **Modular architecture** ready for camera/AI integration
✅ **MobileNetV2 CNN** created for product classification
✅ **Inspector panel** showing component details
❌ **Real 3D models** pending (@react-three/fiber compatibility)
⚠️ **Camera flow** disabled but code preserved

---

## 15. Contact / Repository

- **Project**: Dissectra
- **Platform**: React Native (Android)
- **Location**: `e:\dissectra`
- **APK Path**: `android/app/build/outputs/apk/release/app-release.apk`

---

*Generated for project presentation - May 2026*
