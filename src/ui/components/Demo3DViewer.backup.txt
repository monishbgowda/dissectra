import React, {
  forwardRef,
  useImperativeHandle,
  useRef,
} from 'react';

import {
  StyleSheet,
  View,
} from 'react-native';

import {
  WebView,
} from 'react-native-webview';

import type {
  WebViewMessageEvent,
  WebView as WebViewType,
} from 'react-native-webview';


export interface Demo3DViewerRef {
  explode: () => void;
  assemble: () => void;
  reset: () => void;
}

interface Demo3DViewerProps {
  onComponentSelected?: (
    component: {
      name: string;
      material: string;
      description: string;
    },
  ) => void;
}


const VIEWER_HTML = `
<!DOCTYPE html>

<html>
<head>

<meta
  name="viewport"
  content="
    width=device-width,
    initial-scale=1,
    maximum-scale=1,
    user-scalable=no
  "
/>

<style>

html,
body {
  margin: 0;
  padding: 0;

  width: 100%;
  height: 100%;

  overflow: hidden;

  background: #090909;

  touch-action: none;
}

canvas {
  display: block;

  width: 100%;
  height: 100%;

  touch-action: none;
}

#hint {
  position: absolute;

  left: 0;
  right: 0;
  bottom: 16px;

  text-align: center;

  color: rgba(
    255,
    255,
    255,
    0.45
  );

  font-family:
    Arial,
    sans-serif;

  font-size: 11px;

  pointer-events: none;
}

</style>

</head>


<body>

<canvas id="canvas"></canvas>

<div id="hint">
  Drag to rotate • Pinch to zoom • Tap a part
</div>


<script>

(function () {

  const canvas =
    document.getElementById(
      'canvas'
    );

  const gl =
    canvas.getContext(
      'webgl',
      {
        antialias: true,
        alpha: false
      }
    );

  if (!gl) {

    document.body.innerHTML =
      '<div style="' +
      'color:white;' +
      'font-family:Arial;' +
      'padding:30px;' +
      'text-align:center;' +
      '">' +
      'WebGL is not available on this device.' +
      '</div>';

    return;
  }


  /* -----------------------------------------
     SHADERS
  ----------------------------------------- */

  const vertexShaderSource = \`

    attribute vec3 aPosition;
    attribute vec3 aNormal;

    uniform mat4 uProjection;
    uniform mat4 uModelView;
    uniform mat3 uNormalMatrix;

    varying vec3 vNormal;
    varying vec3 vPosition;

    void main() {

      vec4 viewPosition =
        uModelView *
        vec4(
          aPosition,
          1.0
        );

      vPosition =
        viewPosition.xyz;

      vNormal =
        normalize(
          uNormalMatrix *
          aNormal
        );

      gl_Position =
        uProjection *
        viewPosition;
    }

  \`;


  const fragmentShaderSource = \`

    precision mediump float;

    varying vec3 vNormal;
    varying vec3 vPosition;

    uniform vec3 uColor;
    uniform float uSelected;

    void main() {

      vec3 normal =
        normalize(
          vNormal
        );

      vec3 lightDirection =
        normalize(
          vec3(
            0.4,
            0.8,
            1.0
          )
        );

      float diffuse =
        max(
          dot(
            normal,
            lightDirection
          ),
          0.0
        );

      float ambient =
        0.28;

      float lighting =
        ambient +
        diffuse * 0.72;

      vec3 base =
        uColor;

      if (
        uSelected >
        0.5
      ) {

        base =
          mix(
            base,
            vec3(
              1.0,
              1.0,
              1.0
            ),
            0.30
          );
      }

      gl_FragColor =
        vec4(
          base * lighting,
          1.0
        );
    }

  \`;


  function createShader(
    type,
    source
  ) {

    const shader =
      gl.createShader(
        type
      );

    gl.shaderSource(
      shader,
      source
    );

    gl.compileShader(
      shader
    );

    if (
      !gl.getShaderParameter(
        shader,
        gl.COMPILE_STATUS
      )
    ) {

      throw new Error(
        gl.getShaderInfoLog(
          shader
        )
      );
    }

    return shader;
  }


  const program =
    gl.createProgram();

  gl.attachShader(
    program,
    createShader(
      gl.VERTEX_SHADER,
      vertexShaderSource
    )
  );

  gl.attachShader(
    program,
    createShader(
      gl.FRAGMENT_SHADER,
      fragmentShaderSource
    )
  );

  gl.linkProgram(
    program
  );

  gl.useProgram(
    program
  );


  /* -----------------------------------------
     LOCATIONS
  ----------------------------------------- */

  const positionLocation =
    gl.getAttribLocation(
      program,
      'aPosition'
    );

  const normalLocation =
    gl.getAttribLocation(
      program,
      'aNormal'
    );

  const projectionLocation =
    gl.getUniformLocation(
      program,
      'uProjection'
    );

  const modelViewLocation =
    gl.getUniformLocation(
      program,
      'uModelView'
    );

  const normalMatrixLocation =
    gl.getUniformLocation(
      program,
      'uNormalMatrix'
    );

  const colorLocation =
    gl.getUniformLocation(
      program,
      'uColor'
    );

  const selectedLocation =
    gl.getUniformLocation(
      program,
      'uSelected'
    );


  /* -----------------------------------------
     CUBE GEOMETRY

     Each demo component is currently a
     cuboid.

     This is temporary geometry, but it is
     REAL interactive WebGL.

     The next stage replaces these shapes
     with GLB meshes.
  ----------------------------------------- */

  const positions =
    new Float32Array([

      // FRONT
      -1,-1, 1,
       1,-1, 1,
       1, 1, 1,

      -1,-1, 1,
       1, 1, 1,
      -1, 1, 1,


      // BACK
       1,-1,-1,
      -1,-1,-1,
      -1, 1,-1,

       1,-1,-1,
      -1, 1,-1,
       1, 1,-1,


      // TOP
      -1, 1, 1,
       1, 1, 1,
       1, 1,-1,

      -1, 1, 1,
       1, 1,-1,
      -1, 1,-1,


      // BOTTOM
      -1,-1,-1,
       1,-1,-1,
       1,-1, 1,

      -1,-1,-1,
       1,-1, 1,
      -1,-1, 1,


      // RIGHT
       1,-1, 1,
       1,-1,-1,
       1, 1,-1,

       1,-1, 1,
       1, 1,-1,
       1, 1, 1,


      // LEFT
      -1,-1,-1,
      -1,-1, 1,
      -1, 1, 1,

      -1,-1,-1,
      -1, 1, 1,
      -1, 1,-1

    ]);


  const normals =
    new Float32Array([

      0,0,1,
      0,0,1,
      0,0,1,

      0,0,1,
      0,0,1,
      0,0,1,


      0,0,-1,
      0,0,-1,
      0,0,-1,

      0,0,-1,
      0,0,-1,
      0,0,-1,


      0,1,0,
      0,1,0,
      0,1,0,

      0,1,0,
      0,1,0,
      0,1,0,


      0,-1,0,
      0,-1,0,
      0,-1,0,

      0,-1,0,
      0,-1,0,
      0,-1,0,


      1,0,0,
      1,0,0,
      1,0,0,

      1,0,0,
      1,0,0,
      1,0,0,


      -1,0,0,
      -1,0,0,
      -1,0,0,

      -1,0,0,
      -1,0,0,
      -1,0,0

    ]);


  const positionBuffer =
    gl.createBuffer();

  gl.bindBuffer(
    gl.ARRAY_BUFFER,
    positionBuffer
  );

  gl.bufferData(
    gl.ARRAY_BUFFER,
    positions,
    gl.STATIC_DRAW
  );


  const normalBuffer =
    gl.createBuffer();

  gl.bindBuffer(
    gl.ARRAY_BUFFER,
    normalBuffer
  );

  gl.bufferData(
    gl.ARRAY_BUFFER,
    normals,
    gl.STATIC_DRAW
  );


  /* -----------------------------------------
     COMPONENTS
  ----------------------------------------- */

  const components = [

    {
      name:
        'Outer Housing',

      material:
        'ABS Polymer',

      description:
        'Protective shell surrounding the internal mechanism.',

      position:
        [-1.25, 0.25, 0],

      scale:
        [1.35, 0.75, 0.72],

      explode:
        [-2.0, 0.0, 0.0],

      color:
        [0.82, 0.82, 0.82]
    },


    {
      name:
        'Electric Motor',

      material:
        'Copper / Steel',

      description:
        'Converts electrical energy into rotational mechanical energy.',

      position:
        [0.10, 0.25, 0],

      scale:
        [0.65, 0.55, 0.55],

      explode:
        [0.0, 1.55, 0.0],

      color:
        [0.48, 0.48, 0.48]
    },


    {
      name:
        'Gearbox',

      material:
        'Steel',

      description:
        'Transfers motor rotation and increases usable torque.',

      position:
        [1.15, 0.25, 0],

      scale:
        [0.48, 0.60, 0.60],

      explode:
        [1.5, 0.8, 0.0],

      color:
        [0.67, 0.67, 0.67]
    },


    {
      name:
        'Chuck Assembly',

      material:
        'Hardened Steel',

      description:
        'Grips the drill bit and transfers rotational force to it.',

      position:
        [2.0, 0.25, 0],

      scale:
        [0.40, 0.42, 0.42],

      explode:
        [2.6, 0.0, 0.0],

      color:
        [0.36, 0.36, 0.36]
    },


    {
      name:
        'Battery Pack',

      material:
        'Lithium-ion / Polymer',

      description:
        'Stores electrical energy used to power the drill motor.',

      position:
        [-0.60, -1.45, 0],

      scale:
        [0.85, 0.55, 0.72],

      explode:
        [-0.4, -2.0, 0.0],

      color:
        [0.24, 0.24, 0.24]
    }

  ];


  let explodeAmount = 0;

  let targetExplode = 0;

  let rotationX =
    -0.25;

  let rotationY =
    -0.35;

  let zoom =
    7.5;

  let selectedIndex =
    -1;


  /* -----------------------------------------
     MATRIX HELPERS
  ----------------------------------------- */

  function identity() {

    return [
      1,0,0,0,
      0,1,0,0,
      0,0,1,0,
      0,0,0,1
    ];
  }


  function multiply(
    a,
    b
  ) {

    const out =
      new Array(16)
        .fill(0);

    for (
      let row = 0;
      row < 4;
      row++
    ) {

      for (
        let col = 0;
        col < 4;
        col++
      ) {

        for (
          let k = 0;
          k < 4;
          k++
        ) {

          out[
            col * 4 +
            row
          ] +=
            a[
              k * 4 +
              row
            ] *
            b[
              col * 4 +
              k
            ];
        }
      }
    }

    return out;
  }


  function perspective(
    fov,
    aspect,
    near,
    far
  ) {

    const f =
      1 /
      Math.tan(
        fov / 2
      );

    const nf =
      1 /
      (near - far);

    return [

      f / aspect,
      0,
      0,
      0,

      0,
      f,
      0,
      0,

      0,
      0,
      (far + near) * nf,
      -1,

      0,
      0,
      2 * far * near * nf,
      0

    ];
  }


  function translation(
    x,
    y,
    z
  ) {

    return [

      1,0,0,0,
      0,1,0,0,
      0,0,1,0,
      x,y,z,1

    ];
  }


  function scaling(
    x,
    y,
    z
  ) {

    return [

      x,0,0,0,
      0,y,0,0,
      0,0,z,0,
      0,0,0,1

    ];
  }


  function rotationXMatrix(
    angle
  ) {

    const c =
      Math.cos(angle);

    const s =
      Math.sin(angle);

    return [

      1,0,0,0,
      0,c,s,0,
      0,-s,c,0,
      0,0,0,1

    ];
  }


  function rotationYMatrix(
    angle
  ) {

    const c =
      Math.cos(angle);

    const s =
      Math.sin(angle);

    return [

      c,0,-s,0,
      0,1,0,0,
      s,0,c,0,
      0,0,0,1

    ];
  }


  function normalMatrix(
    modelView
  ) {

    /*
     * Good enough for our current
     * axis-aligned cuboid demo.
     *
     * The GLB stage will use Three.js
     * normal matrices automatically.
     */

    return [

      modelView[0],
      modelView[1],
      modelView[2],

      modelView[4],
      modelView[5],
      modelView[6],

      modelView[8],
      modelView[9],
      modelView[10]

    ];
  }


  /* -----------------------------------------
     RESIZE
  ----------------------------------------- */

  function resize() {

    const dpr =
      Math.min(
        window.devicePixelRatio ||
        1,
        2
      );

    const width =
      Math.floor(
        canvas.clientWidth *
        dpr
      );

    const height =
      Math.floor(
        canvas.clientHeight *
        dpr
      );

    if (
      canvas.width !== width ||
      canvas.height !== height
    ) {

      canvas.width =
        width;

      canvas.height =
        height;
    }

    gl.viewport(
      0,
      0,
      canvas.width,
      canvas.height
    );
  }


  /* -----------------------------------------
     DRAW
  ----------------------------------------- */

  function drawComponent(
    component,
    index,
    projection
  ) {

    const explodedX =
      component.position[0] +
      component.explode[0] *
      explodeAmount;

    const explodedY =
      component.position[1] +
      component.explode[1] *
      explodeAmount;

    const explodedZ =
      component.position[2] +
      component.explode[2] *
      explodeAmount;


    let matrix =
      translation(
        0,
        0,
        -zoom
      );

    matrix =
      multiply(
        matrix,
        rotationXMatrix(
          rotationX
        )
      );

    matrix =
      multiply(
        matrix,
        rotationYMatrix(
          rotationY
        )
      );

    matrix =
      multiply(
        matrix,
        translation(
          explodedX,
          explodedY,
          explodedZ
        )
      );

    matrix =
      multiply(
        matrix,
        scaling(
          component.scale[0],
          component.scale[1],
          component.scale[2]
        )
      );


    gl.uniformMatrix4fv(
      modelViewLocation,
      false,
      new Float32Array(
        matrix
      )
    );

    gl.uniformMatrix3fv(
      normalMatrixLocation,
      false,
      new Float32Array(
        normalMatrix(
          matrix
        )
      )
    );

    gl.uniform3fv(
      colorLocation,
      new Float32Array(
        component.color
      )
    );

    gl.uniform1f(
      selectedLocation,
      index ===
        selectedIndex
        ? 1
        : 0
    );

    gl.drawArrays(
      gl.TRIANGLES,
      0,
      36
    );
  }


  function render() {

    resize();


    explodeAmount +=
      (
        targetExplode -
        explodeAmount
      ) * 0.08;


    gl.enable(
      gl.DEPTH_TEST
    );

    gl.enable(
      gl.CULL_FACE
    );


    gl.clearColor(
      0.035,
      0.035,
      0.035,
      1
    );

    gl.clear(
      gl.COLOR_BUFFER_BIT |
      gl.DEPTH_BUFFER_BIT
    );


    gl.bindBuffer(
      gl.ARRAY_BUFFER,
      positionBuffer
    );

    gl.enableVertexAttribArray(
      positionLocation
    );

    gl.vertexAttribPointer(
      positionLocation,
      3,
      gl.FLOAT,
      false,
      0,
      0
    );


    gl.bindBuffer(
      gl.ARRAY_BUFFER,
      normalBuffer
    );

    gl.enableVertexAttribArray(
      normalLocation
    );

    gl.vertexAttribPointer(
      normalLocation,
      3,
      gl.FLOAT,
      false,
      0,
      0
    );


    const aspect =
      canvas.width /
      Math.max(
        canvas.height,
        1
      );

    const projection =
      perspective(
        Math.PI / 4,
        aspect,
        0.1,
        100
      );


    gl.uniformMatrix4fv(
      projectionLocation,
      false,
      new Float32Array(
        projection
      )
    );


    components.forEach(
      (
        component,
        index
      ) => {

        drawComponent(
          component,
          index,
          projection
        );
      }
    );


    requestAnimationFrame(
      render
    );
  }


  /* -----------------------------------------
     TOUCH
  ----------------------------------------- */

  let dragging =
    false;

  let moved =
    false;

  let lastX =
    0;

  let lastY =
    0;

  let pinchDistance =
    0;


  function distance(
    a,
    b
  ) {

    const dx =
      a.clientX -
      b.clientX;

    const dy =
      a.clientY -
      b.clientY;

    return Math.sqrt(
      dx * dx +
      dy * dy
    );
  }


  canvas.addEventListener(
    'touchstart',
    function (event) {

      if (
        event.touches.length ===
        1
      ) {

        dragging =
          true;

        moved =
          false;

        lastX =
          event.touches[0]
            .clientX;

        lastY =
          event.touches[0]
            .clientY;
      }


      if (
        event.touches.length ===
        2
      ) {

        dragging =
          false;

        pinchDistance =
          distance(
            event.touches[0],
            event.touches[1]
          );
      }

    },
    {
      passive: false
    }
  );


  canvas.addEventListener(
    'touchmove',
    function (event) {

      event.preventDefault();


      if (
        event.touches.length ===
          1 &&
        dragging
      ) {

        const x =
          event.touches[0]
            .clientX;

        const y =
          event.touches[0]
            .clientY;

        const dx =
          x - lastX;

        const dy =
          y - lastY;


        if (
          Math.abs(dx) +
          Math.abs(dy) >
          2
        ) {

          moved =
            true;
        }


        rotationY +=
          dx * 0.008;

        rotationX +=
          dy * 0.008;


        rotationX =
          Math.max(
            -1.4,
            Math.min(
              1.4,
              rotationX
            )
          );


        lastX =
          x;

        lastY =
          y;
      }


      if (
        event.touches.length ===
        2
      ) {

        const nextDistance =
          distance(
            event.touches[0],
            event.touches[1]
          );

        const difference =
          nextDistance -
          pinchDistance;


        zoom -=
          difference *
          0.015;


        zoom =
          Math.max(
            4.5,
            Math.min(
              12,
              zoom
            )
          );


        pinchDistance =
          nextDistance;
      }

    },
    {
      passive: false
    }
  );


  canvas.addEventListener(
    'touchend',
    function () {

      if (
        dragging &&
        !moved
      ) {

        /*
         * Temporary component selection:
         * cycle through components on tap.
         *
         * GLB stage will replace this with
         * actual raycasting.
         */

        selectedIndex =
          (
            selectedIndex +
            1
          ) %
          components.length;


        const component =
          components[
            selectedIndex
          ];


        if (
          window.ReactNativeWebView
        ) {

          window
            .ReactNativeWebView
            .postMessage(
              JSON.stringify({
                type:
                  'componentSelected',

                component: {
                  name:
                    component.name,

                  material:
                    component.material,

                  description:
                    component.description
                }
              })
            );
        }
      }


      dragging =
        false;

      pinchDistance =
        0;
    }
  );


  /* -----------------------------------------
     REACT NATIVE COMMANDS
  ----------------------------------------- */

  function handleMessage(
    raw
  ) {

    try {

      const message =
        JSON.parse(raw);


      if (
        message.type ===
        'explode'
      ) {

        targetExplode =
          targetExplode >
          0.5
            ? 0
            : 1;
      }


      if (
        message.type ===
        'assemble'
      ) {

        targetExplode =
          0;
      }


      if (
        message.type ===
        'reset'
      ) {

        targetExplode =
          0;

        rotationX =
          -0.25;

        rotationY =
          -0.35;

        zoom =
          7.5;

        selectedIndex =
          -1;
      }

    } catch (error) {

      console.log(
        error
      );
    }
  }


  /*
   * Android WebView uses document message.
   * iOS may use window message.
   */

  document.addEventListener(
    'message',
    function (event) {

      handleMessage(
        event.data
      );
    }
  );


  window.addEventListener(
    'message',
    function (event) {

      handleMessage(
        event.data
      );
    }
  );


  render();

})();

</script>

</body>
</html>
`;


export const Demo3DViewer =
  forwardRef<
    Demo3DViewerRef,
    Demo3DViewerProps
  >(
    function Demo3DViewer(
      {
        onComponentSelected,
      },
      ref,
    ) {
      const webViewRef =
        useRef<
          React.ElementRef<
            typeof WebView
          >
        >(null);

      function sendCommand(
        type: string,
      ) {
        webViewRef.current
          ?.postMessage(
            JSON.stringify({
              type,
            }),
          );
      }

      useImperativeHandle(
        ref,
        () => ({
          explode() {
            sendCommand(
              'explode',
            );
          },

          assemble() {
            sendCommand(
              'assemble',
            );
          },

          reset() {
            sendCommand(
              'reset',
            );
          },
        }),
        [],
      );

      function handleMessage(
        event: WebViewMessageEvent,
      ) {
        try {
          const data =
            JSON.parse(
              event.nativeEvent.data,
            );

          if (
            data.type ===
              'componentSelected' &&
            data.component
          ) {
            onComponentSelected?.(
              data.component,
            );
          }
        } catch {
          // Ignore malformed messages.
        }
      }

      return (
        <View
          style={
            styles.container
          }
        >
          <WebView
            ref={webViewRef}
            source={{
              html: VIEWER_HTML,
            }}
            style={
              styles.webView
            }
            originWhitelist={[
              '*',
            ]}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            scrollEnabled={false}
            overScrollMode="never"
            onMessage={
              handleMessage
            }
            androidLayerType="hardware"
            setBuiltInZoomControls={
              false
            }
            setDisplayZoomControls={
              false
            }
          />
        </View>
      );
    },
  );


const styles =
  StyleSheet.create({
    container: {
      flex: 1,

      overflow:
        'hidden',

      borderRadius: 20,

      backgroundColor:
        '#090909',
    },

    webView: {
      flex: 1,

      backgroundColor:
        '#090909',
    },
  });