# Dissectra Stable Release v1.0.0

Date: 2026-05-20

## Release status

Stable release candidate prepared and validated for the React Native CLI + Metro application and Express backend.

## Included

- Dark medical-tech React Native app shell with bottom tab navigation.
- Image capture/gallery upload with preview.
- Backend-protected Gemini anatomy analysis flow.
- Backend model generation abstraction for mock, Tripo, or Meshy providers.
- Three.js/react-three-fiber native GLB viewer with rotate, zoom, pan, and lighting support.
- Local persistence using `react-native-fs` folders and AsyncStorage metadata.
- History screen for reopening analyzed scans.
- Express security baseline: Helmet, CORS config, multer file type and size validation, backend-only secrets.
- Metro support for 3D model assets: glb, gltf, obj, mtl, bin.

## Validation

- `npm run typecheck`: passed
- `npm test -- --runInBand`: passed, 2 suites and 4 tests
- Backend syntax checks: passed

## Runtime setup

1. `npm install`
2. `cp .env.example .env`
3. `cp backend/.env.example backend/.env`
4. Add backend secrets to `backend/.env`.
5. Start backend with `npm run backend`.
6. Start Metro with `npm start`.
7. Build/run mobile app with `npm run android` or `npm run ios`.

## Notes

- `MODEL_PROVIDER=mock` is stable and returns a demo GLB without paid 3D API credentials.
- For production 3D generation, set `MODEL_PROVIDER=tripo` or `meshy` and complete the isolated provider contract in `backend/services/modelProvider.js` based on your vendor account/API version.
- Never place Gemini/Tripo/Meshy API keys in the React Native frontend.
