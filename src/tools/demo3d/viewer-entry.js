import * as THREE from 'three';

import {
  GLTFLoader,
} from 'three/examples/jsm/loaders/GLTFLoader.js';

window.Dissectra3D = {
  THREE,
  GLTFLoader,
};

console.log(
  'Dissectra 3D engine initialized',
);

if (
  window.ReactNativeWebView
) {
  window.ReactNativeWebView.postMessage(
    JSON.stringify({
      type: 'engineReady',
      message:
        'Three.js and GLTFLoader loaded successfully',
    }),
  );
}