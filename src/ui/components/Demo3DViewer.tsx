import React, {
  forwardRef,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';

import {
  ActivityIndicator,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import WebView from
  'react-native-webview';

import type {
  WebViewMessageEvent,
  WebViewErrorEvent,
} from
  'react-native-webview/lib/WebViewTypes';

import {
  useTheme,
} from '../../theme/ThemeProvider';

/*
 * Data returned by viewer.html
 * when the user taps a component.
 */
export type SelectedComponent = {
  name: string;
  material: string;
  description: string;
};


/*
 * Methods exposed by Demo3DViewer
 * to Demo3DScreen through ref.
 */
export type Demo3DViewerRef = {
  explode: () => void;

  assemble: () => void;

  reset: () => void;

  setBackground: (
    color: string,
  ) => void;
};


type Demo3DViewerProps = {
  onComponentSelected?: (
    component: SelectedComponent,
  ) => void;
};


/*
 * Messages that can arrive from
 * viewer.html.
 */
type ViewerMessage = {
  type?: string;

  name?: string;

  material?: string;

  description?: string;

  component?: {
    name?: string;

    material?: string;

    description?: string;
  };

  message?: string;

  loaded?: number;

  total?: number;
};


export const Demo3DViewer =
  forwardRef<
    Demo3DViewerRef,
    Demo3DViewerProps
  >(function Demo3DViewer(
    {
      onComponentSelected,
    },
    ref,
  ) {
    const { theme } =
      useTheme();

const webViewRef =
  useRef<
    React.ElementRef<
      typeof WebView
    >
  >(null);

    const [
      loading,
      setLoading,
    ] =
      useState(true);

    const [
      error,
      setError,
    ] =
      useState<
        string | null
      >(null);


    /*
     * Send a JSON command to
     * viewer.html.
     */
    function sendCommand(
      command:
        Record<
          string,
          unknown
        >,
    ) {
      webViewRef.current
        ?.postMessage(
          JSON.stringify(
            command,
          ),
        );
    }


    /*
     * Expose controls to
     * Demo3DScreen.
     */
    useImperativeHandle(
  ref,

  () => ({
    explode() {
      sendCommand({
        type: 'explode',
      });
    },

    assemble() {
      sendCommand({
        type: 'assemble',
      });
    },

    reset() {
      sendCommand({
        type: 'reset',
      });
    },

    setBackground(
      color: string,
    ) {
      sendCommand({
        type: 'setBackground',
        color,
      });
    },
  }),

  [],
);


    /*
     * Receive messages from
     * viewer.html.
     */
    function handleMessage(
      event:
        WebViewMessageEvent,
    ) {
      try {
        const data:
          ViewerMessage =
          JSON.parse(
            event.nativeEvent
              .data,
          );


        /*
         * Model successfully
         * loaded.
         */
        if (
          data.type ===
          'modelLoaded'
        ) {
          setLoading(false);

          setError(null);

          return;
        }


        /*
         * Component selected by
         * Three.js raycaster.
         */
        if (
  data.type ===
  'componentSelected'
) {
  /*
   * Support both message formats:
   *
   * 1. Nested:
   *    { component: {...} }
   *
   * 2. Flat:
   *    { name, material, description }
   */

  const component =
    data.component;


  const name =
    component?.name ??
    data.name ??
    'Unknown component';


  const material =
    component?.material ??
    data.material ??
    'Unknown';


  const description =
    component?.description ??
    data.description ??
    'No description available.';


  console.log(
    '[Dissectra 3D] Component selected:',
    {
      name,
      material,
      description,
    },
  );


  onComponentSelected?.({
    name,

    material,

    description,
  });


  return;
}


        /*
         * Debug messages from
         * viewer.html.
         */
        if (
          data.type ===
          'debug'
        ) {
          console.log(
            '[Dissectra 3D]',
            data.message,
          );

          return;
        }


        /*
         * GLB loading error.
         */
        if (
          data.type ===
            'modelError' ||
          data.type ===
            'engineError' ||
          data.type ===
            'javascriptError'
        ) {
          console.error(
            '[Dissectra 3D]',
            data,
          );

          setLoading(false);

          setError(
            data.message ??
              'Unable to load the 3D model.',
          );

          return;
        }


        /*
         * Optional progress logging.
         */
        if (
          data.type ===
          'modelProgress'
        ) {
          console.log(
            '[Dissectra 3D] Loading:',
            data.loaded,
            '/',
            data.total,
          );
        }
      } catch (
        parseError
      ) {
        console.warn(
          '[Dissectra 3D] Invalid WebView message:',
          event.nativeEvent
            .data,
        );
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
            uri:
              'file:///android_asset/demo3d/viewer.html',
          }}

          style={
            styles.webView
          }

          javaScriptEnabled={
            true
          }

          domStorageEnabled={
            true
          }

          allowFileAccess={
            true
          }

          allowFileAccessFromFileURLs={
            true
          }

          allowUniversalAccessFromFileURLs={
            true
          }

          originWhitelist={[
            '*',
          ]}

          mixedContentMode="always"

          onMessage={
            handleMessage
          }

          onLoadStart={() => {
            console.log(
              '[Dissectra 3D] WebView loading started',
            );

            setLoading(true);

            setError(null);
          }}

          onLoadEnd={() => {
  console.log(
    '[Dissectra 3D] WebView loading finished',
  );

  /*
   * viewer.html itself already displays
   * "Loading 3D model..." while the GLB
   * is loading.
   *
   * Remove the React Native overlay once
   * the HTML/JS engine has loaded so it
   * cannot permanently hide the WebGL canvas.
   */
  setLoading(false);
}}

          onError={event => {
            const message =
              event.nativeEvent
                .description ??
              'WebView failed to load.';

            console.error(
              '[Dissectra 3D] WebView error:',
              message,
            );

            setLoading(false);

            setError(
              message,
            );
          }}
        />


        {loading &&
          !error && (
            <View
              pointerEvents="none"
              style={[
                styles.overlay,

                {
                  backgroundColor:
                    theme.colors
                      .surface,
                },
              ]}
            >
              <ActivityIndicator
                size="large"
                color={
                  theme.colors
                    .primary
                }
              />

              <Text
                style={[
                  styles.loadingText,

                  {
                    color:
                      theme.colors
                        .textSecondary,
                  },
                ]}
              >
                Loading 3D model...
              </Text>
            </View>
          )}


        {error && (
          <View
            pointerEvents="none"
            style={[
              styles.overlay,

              {
                backgroundColor:
                  theme.colors
                    .surface,
              },
            ]}
          >
            <Text
              style={[
                styles.errorTitle,

                {
                  color:
                    theme.colors
                      .text,
                },
              ]}
            >
              Unable to load 3D model
            </Text>

            <Text
              style={[
                styles.errorText,

                {
                  color:
                    theme.colors
                      .textSecondary,
                },
              ]}
            >
              {error}
            </Text>
          </View>
        )}
      </View>
    );
  });


const styles =
  StyleSheet.create({
    container: {
      flex: 1,

      position:
        'relative',

      overflow:
        'hidden',
    },


    webView: {
      flex: 1,

      backgroundColor:
        'transparent',
    },


    overlay: {
  position:
    'absolute',

  top: 0,

  right: 0,

  bottom: 0,

  left: 0,

  alignItems:
    'center',

  justifyContent:
    'center',

  padding: 24,
},


    loadingText: {
      marginTop: 14,

      fontSize: 13,

      fontWeight:
        '600',
    },


    errorTitle: {
      fontSize: 16,

      fontWeight:
        '700',

      textAlign:
        'center',
    },


    errorText: {
      marginTop: 8,

      fontSize: 12,

      lineHeight: 18,

      textAlign:
        'center',
    },
  });