import React, {
  useRef,
  useState,
} from 'react';

import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
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
  const insets = useSafeAreaInsets();
  const { width, height } =
    useWindowDimensions();

  const isLandscape =
    width > height;

  const viewerRef =
    useRef<Demo3DViewerRef>(null);

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

  const [
    backgroundMenuOpen,
    setBackgroundMenuOpen,
  ] =
    useState(false);


  function toggleExploded() {
  if (exploded) {
    viewerRef.current?.assemble();
  } else {
    viewerRef.current?.explode();
  }

  setExploded(
    value => !value,
  );
}


  function resetViewer() {
    viewerRef.current?.reset();

    setExploded(false);

    setSelectedComponent(null);
  }


  function setViewerBackground(
    color: string,
  ) {
    viewerRef.current?.setBackground?.(
      color,
    );

    setBackgroundMenuOpen(false);
  }


  const backgroundOptions = [
    ['black', 'Black'],
    ['charcoal', 'Charcoal'],
    ['gray', 'Gray'],
    ['light', 'Light Gray'],
    ['white', 'White'],
    ['navy', 'Navy'],
  ] as const;


  const backgroundPicker = (
    <View style={styles.backgroundSection}>
      <Pressable
        onPress={() =>
          setBackgroundMenuOpen(
            value => !value,
          )
        }
        style={[
          styles.backgroundButton,
          {
            backgroundColor:
              theme.colors.surface,
            borderColor:
              theme.colors.border,
          },
        ]}
      >
        <Icon
          name="color-palette-outline"
          size={20}
          color={theme.colors.text}
        />
        <Text
          style={[
            styles.controlText,
            {
              color: theme.colors.text,
            },
          ]}
        >
          BACKGROUND
        </Text>
      </Pressable>

      {backgroundMenuOpen && (
        <View
          style={[
            styles.backgroundMenu,
            {
              backgroundColor:
                theme.colors.surface,
              borderColor:
                theme.colors.border,
            },
          ]}
        >
          {backgroundOptions.map(
            ([value, label]) => (
              <Pressable
                key={value}
                onPress={() =>
                  setViewerBackground(
                    value,
                  )
                }
                style={
                  styles.backgroundOption
                }
              >
                <View
                  style={[
                    styles.colorDot,
                    {
                      backgroundColor:
                        value === 'black'
                          ? '#090909'
                          : value ===
                              'charcoal'
                            ? '#1c1c1e'
                            : value ===
                                'gray'
                              ? '#5a5a5f'
                              : value ===
                                  'light'
                                ? '#d9d9de'
                                : value ===
                                    'white'
                                  ? '#ffffff'
                                  : '#101827',
                      borderColor:
                        theme.colors.border,
                    },
                  ]}
                />
                <Text
                  style={[
                    styles.backgroundOptionText,
                    {
                      color:
                        theme.colors.text,
                    },
                  ]}
                >
                  {label}
                </Text>
              </Pressable>
            ),
          )}
        </View>
      )}
    </View>
  );


  const controls = (
    <View style={styles.controls}>
      <Pressable
        onPress={toggleExploded}
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
          color={theme.colors.text}
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

      <Pressable
        onPress={resetViewer}
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
          color={theme.colors.text}
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
  );


  const inspector = (
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
        {selectedComponent?.name ??
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
            {selectedComponent.material}
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
            {selectedComponent.description}
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
  );


  return (
    <View
      style={[
        styles.screen,
        {
          backgroundColor:
            theme.colors.background,
          paddingTop:
            insets.top,
          paddingBottom:
            insets.bottom,
        },
      ]}
    >
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
          style={styles.iconButton}
          onPress={() =>
            navigation.goBack()
          }
        >
          <Icon
            name="chevron-back"
            size={26}
            color={theme.colors.text}
          />
        </Pressable>

        <View style={styles.headerText}>
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

        <View style={styles.iconButton} />
      </View>

      {isLandscape ? (
        <View style={styles.landscapeContent}>
          <View
            style={[
              styles.viewer,
              styles.landscapeViewer,
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

          <ScrollView
            style={styles.landscapePanel}
            contentContainerStyle={
              styles.landscapePanelContent
            }
            showsVerticalScrollIndicator={
              false
            }
          >
            {backgroundPicker}
            {controls}
            {inspector}
          </ScrollView>
        </View>
      ) : (
        <ScrollView
          style={styles.portraitScroll}
          contentContainerStyle={
            styles.portraitContent
          }
          showsVerticalScrollIndicator={
            false
          }
        >
          <View
            style={[
              styles.viewer,
              styles.portraitViewer,
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

          {backgroundPicker}
          {controls}
          {inspector}
        </ScrollView>
      )}
    </View>
  );
}


const styles =
  StyleSheet.create({
    screen: {
      flex: 1,
    },

    header: {
      minHeight: 58,
      paddingHorizontal: 12,
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

    portraitScroll: {
      flex: 1,
    },

    portraitContent: {
      flexGrow: 1,
      padding: 16,
      gap: 14,
    },

    landscapeContent: {
      flex: 1,
      flexDirection: 'row',
      padding: 10,
      gap: 12,
    },

    viewer: {
      borderWidth: 1,
      borderRadius: 20,
      overflow: 'hidden',
    },

    portraitViewer: {
      height: 390,
      minHeight: 300,
    },

    landscapeViewer: {
      flex: 1.65,
      minWidth: 0,
    },

    landscapePanel: {
      flex: 1,
      minWidth: 250,
    },

    landscapePanelContent: {
      paddingRight: 4,
      paddingBottom: 12,
      gap: 12,
    },

    backgroundSection: {
      position: 'relative',
      zIndex: 20,
    },

    backgroundButton: {
      minHeight: 46,
      borderWidth: 1,
      borderRadius: 14,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      paddingHorizontal: 12,
    },

    backgroundMenu: {
      marginTop: 8,
      borderWidth: 1,
      borderRadius: 14,
      paddingVertical: 6,
      overflow: 'hidden',
    },

    backgroundOption: {
      minHeight: 42,
      paddingHorizontal: 14,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },

    colorDot: {
      width: 20,
      height: 20,
      borderRadius: 10,
      borderWidth: 1,
    },

    backgroundOptionText: {
      fontSize: 13,
      fontWeight: '600',
    },

    controls: {
      flexDirection: 'row',
      gap: 10,
    },

    control: {
      flex: 1,
      minHeight: 52,
      borderWidth: 1,
      borderRadius: 14,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      paddingHorizontal: 10,
    },

    controlText: {
      fontSize: 12,
      fontWeight: '800',
      letterSpacing: 0.5,
    },

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
