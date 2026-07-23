import React, {
  useRef,
  useState,
} from 'react';

import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import Icon from 'react-native-vector-icons/Ionicons';

import {
  useSafeAreaInsets,
} from 'react-native-safe-area-context';

import {
  useTheme,
} from '../../theme/ThemeProvider';

import {
  Demo3DViewer,
  Demo3DViewerRef,
} from '../components/Demo3DViewer';


type SelectedComponent = {
  name: string;
  material: string;
  description: string;
};


export function Demo3DScreen({
  navigation,
}: any) {
  const { theme } = useTheme();

  const insets =
    useSafeAreaInsets();

  const viewerRef =
    useRef<Demo3DViewerRef>(
      null,
    );

  const [
    selectedComponent,
    setSelectedComponent,
  ] =
    useState<SelectedComponent | null>(
      null,
    );

  const [
    exploded,
    setExploded,
  ] =
    useState(false);


  function toggleExploded() {
    viewerRef.current?.explode();

    setExploded(
      value => !value,
    );
  }


  function resetViewer() {
    viewerRef.current?.reset();

    setExploded(false);

    setSelectedComponent(
      null,
    );
  }


  return (
    <View
      style={[
        styles.screen,
        {
          backgroundColor:
            theme.colors.background,

          paddingTop:
            insets.top,
        },
      ]}
    >

      {/* HEADER */}

      <View
        style={[
          styles.header,
          {
            borderBottomColor:
              theme.colors.border,
          },
        ]}
      >
        <Pressable
          style={
            styles.iconButton
          }
          onPress={() =>
            navigation.goBack()
          }
        >
          <Icon
            name="chevron-back"
            size={26}
            color={
              theme.colors.text
            }
          />
        </Pressable>


        <View
          style={
            styles.headerText
          }
        >
          <Text
            style={[
              styles.title,
              {
                color:
                  theme.colors.text,
              },
            ]}
          >
            3D DISSECTION
          </Text>

          <Text
            style={[
              styles.subtitle,
              {
                color:
                  theme.colors
                    .textSecondary,
              },
            ]}
          >
            Interactive demo
          </Text>
        </View>


        {/* Keeps title centered */}

        <View
          style={
            styles.iconButton
          }
        />

      </View>


      {/* MAIN CONTENT */}

      <View
        style={
          styles.content
        }
      >

        {/* 3D VIEWER */}

        <View
          style={[
            styles.viewer,
            {
              backgroundColor:
                theme.colors.surface,

              borderColor:
                theme.colors.border,
            },
          ]}
        >
          <Demo3DViewer
            ref={viewerRef}
            onComponentSelected={
              setSelectedComponent
            }
          />
        </View>


        {/* CONTROLS */}

        <View
          style={
            styles.controls
          }
        >

          {/* EXPLODE / ASSEMBLE */}

          <Pressable
            onPress={
              toggleExploded
            }
            style={[
              styles.control,
              {
                backgroundColor:
                  theme.colors.surface,

                borderColor:
                  theme.colors.border,
              },
            ]}
          >
            <Icon
              name={
                exploded
                  ? 'contract-outline'
                  : 'expand-outline'
              }
              size={20}
              color={
                theme.colors.text
              }
            />

            <Text
              style={[
                styles.controlText,
                {
                  color:
                    theme.colors.text,
                },
              ]}
            >
              {exploded
                ? 'ASSEMBLE'
                : 'EXPLODE'}
            </Text>
          </Pressable>


          {/* RESET */}

          <Pressable
            onPress={
              resetViewer
            }
            style={[
              styles.control,
              {
                backgroundColor:
                  theme.colors.surface,

                borderColor:
                  theme.colors.border,
              },
            ]}
          >
            <Icon
              name="refresh-outline"
              size={20}
              color={
                theme.colors.text
              }
            />

            <Text
              style={[
                styles.controlText,
                {
                  color:
                    theme.colors.text,
                },
              ]}
            >
              RESET
            </Text>
          </Pressable>

        </View>


        {/* COMPONENT INSPECTOR */}

        <View
          style={[
            styles.inspector,
            {
              backgroundColor:
                theme.colors.surface,

              borderColor:
                theme.colors.border,
            },
          ]}
        >

          <Text
            style={[
              styles.inspectorLabel,
              {
                color:
                  theme.colors
                    .textSecondary,
              },
            ]}
          >
            SELECTED COMPONENT
          </Text>


          <Text
            style={[
              styles.componentName,
              {
                color:
                  theme.colors.text,
              },
            ]}
          >
            {selectedComponent
              ?.name ??
              'No component selected'}
          </Text>


          {selectedComponent ? (
            <>

              <Text
                style={[
                  styles.material,
                  {
                    color:
                      theme.colors
                        .textSecondary,
                  },
                ]}
              >
                Material:{' '}
                {
                  selectedComponent
                    .material
                }
              </Text>


              <Text
                style={[
                  styles.componentDescription,
                  {
                    color:
                      theme.colors
                        .textSecondary,
                  },
                ]}
              >
                {
                  selectedComponent
                    .description
                }
              </Text>

            </>
          ) : (

            <Text
              style={[
                styles.componentDescription,
                {
                  color:
                    theme.colors
                      .textSecondary,
                },
              ]}
            >
              Tap the 3D model to inspect
              its internal components.
            </Text>

          )}

        </View>

      </View>

    </View>
  );
}


const styles =
  StyleSheet.create({

    screen: {
      flex: 1,
    },


    /* HEADER */

    header: {
      minHeight: 64,

      paddingHorizontal: 16,

      flexDirection: 'row',

      alignItems: 'center',

      borderBottomWidth:
        StyleSheet.hairlineWidth,
    },

    iconButton: {
      width: 44,

      height: 44,

      alignItems: 'center',

      justifyContent: 'center',
    },

    headerText: {
      flex: 1,

      alignItems: 'center',
    },

    title: {
      fontSize: 15,

      fontWeight: '800',

      letterSpacing: 1,
    },

    subtitle: {
      marginTop: 2,

      fontSize: 11,
    },


    /* CONTENT */

    content: {
      flex: 1,

      padding: 16,

      gap: 14,
    },


    /* VIEWER */

    viewer: {
      flex: 1,

      minHeight: 300,

      borderWidth: 1,

      borderRadius: 20,

      overflow: 'hidden',
    },


    /* CONTROLS */

    controls: {
      flexDirection: 'row',

      gap: 10,
    },

    control: {
      flex: 1,

      height: 52,

      borderWidth: 1,

      borderRadius: 14,

      flexDirection: 'row',

      alignItems: 'center',

      justifyContent: 'center',

      gap: 8,
    },

    controlText: {
      fontSize: 12,

      fontWeight: '800',

      letterSpacing: 0.5,
    },


    /* INSPECTOR */

    inspector: {
      borderWidth: 1,

      borderRadius: 18,

      padding: 18,

      minHeight: 120,
    },

    inspectorLabel: {
      fontSize: 10,

      fontWeight: '700',

      letterSpacing: 1,
    },

    componentName: {
      marginTop: 8,

      fontSize: 18,

      fontWeight: '700',
    },

    material: {
      marginTop: 5,

      fontSize: 12,

      fontWeight: '600',
    },

    componentDescription: {
      marginTop: 6,

      fontSize: 13,

      lineHeight: 19,
    },

  });