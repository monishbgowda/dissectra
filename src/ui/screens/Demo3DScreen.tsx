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
  useTheme,
} from '../../theme/ThemeProvider';

import {
  useSafeAreaInsetsOrFallback,
} from '../components/safeArea';

import {
  Demo3DViewer,
  Demo3DViewerRef,
  SelectedComponent,
} from '../components/Demo3DViewer';

import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../types/navigation';
import type { Supported3DDevice } from '../../utils/resolveSupported3DDevice';

type Demo3DRouteProp = RouteProp<RootStackParamList, 'Demo3D'>;
type Demo3DNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Demo3D'>;

export function Demo3DScreen({
  navigation,
  route,
}: {
  navigation: Demo3DNavigationProp;
  route: Demo3DRouteProp;
}) {
  const deviceType: Supported3DDevice | undefined = route?.params?.deviceType;
  const isValidDevice = deviceType === 'mouse' || deviceType === 'pendrive';

  const { theme } = useTheme();
  const insets = useSafeAreaInsetsOrFallback();
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
      <View style={styles.inspectorHeader}>
        <Text
          style={[
            styles.inspectorLabel,
            {
              color:
                theme.colors.primary,
            },
          ]}
        >
          SELECTED COMPONENT
        </Text>

        {selectedComponent && selectedComponent.replaceable !== undefined && (
          <View
            style={[
              styles.replaceableBadge,
              {
                backgroundColor: selectedComponent.replaceable
                  ? 'rgba(76, 175, 80, 0.12)'
                  : 'rgba(239, 83, 80, 0.12)',
                borderColor: selectedComponent.replaceable
                  ? '#4caf50'
                  : '#ef5350',
              },
            ]}
          >
            <Text
              style={[
                styles.replaceableBadgeText,
                {
                  color: selectedComponent.replaceable
                    ? '#4caf50'
                    : '#ef5350',
                },
              ]}
            >
              {selectedComponent.replaceable ? 'REPLACEABLE' : 'NON-REPLACEABLE'}
            </Text>
          </View>
        )}
      </View>

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
        <View style={styles.componentMetaContainer}>
          <View style={styles.metaField}>
            <Text
              style={[
                styles.metaLabel,
                { color: theme.colors.textSecondary },
              ]}
            >
              MATERIAL
            </Text>
            <Text
              style={[
                styles.metaValue,
                { color: theme.colors.text },
              ]}
            >
              {selectedComponent.material}
            </Text>
          </View>

          {selectedComponent.function ? (
            <View style={styles.metaField}>
              <Text
                style={[
                  styles.metaLabel,
                  { color: theme.colors.textSecondary },
                ]}
              >
                FUNCTION / PURPOSE
              </Text>
              <Text
                style={[
                  styles.metaValue,
                  { color: theme.colors.text },
                ]}
              >
                {selectedComponent.function}
              </Text>
            </View>
          ) : (
            <View style={styles.metaField}>
              <Text
                style={[
                  styles.metaLabel,
                  { color: theme.colors.textSecondary },
                ]}
              >
                DESCRIPTION
              </Text>
              <Text
                style={[
                  styles.metaValue,
                  { color: theme.colors.text },
                ]}
              >
                {selectedComponent.description}
              </Text>
            </View>
          )}

          {selectedComponent.usedIn && selectedComponent.usedIn.length > 0 && (
            <View style={styles.metaField}>
              <Text
                style={[
                  styles.metaLabel,
                  { color: theme.colors.textSecondary },
                ]}
              >
                USED IN
              </Text>
              {selectedComponent.usedIn.map((item, index) => (
                <Text
                  key={index}
                  style={[
                    styles.bulletItem,
                    { color: theme.colors.text },
                  ]}
                >
                  • {item}
                </Text>
              ))}
            </View>
          )}

          {selectedComponent.failureSymptoms && selectedComponent.failureSymptoms.length > 0 && (
            <View style={styles.metaField}>
              <Text
                style={[
                  styles.metaLabel,
                  { color: theme.colors.textSecondary },
                ]}
              >
                COMMON FAILURE SYMPTOMS
              </Text>
              {selectedComponent.failureSymptoms.map((symptom, index) => (
                <Text
                  key={index}
                  style={[
                    styles.bulletItem,
                    { color: theme.colors.text },
                  ]}
                >
                  • {symptom}
                </Text>
              ))}
            </View>
          )}

          {selectedComponent.replacement ? (
            <View style={styles.metaField}>
              <Text
                style={[
                  styles.metaLabel,
                  { color: theme.colors.textSecondary },
                ]}
              >
                REPLACEMENT RECOMMENDATION
              </Text>
              <Text
                style={[
                  styles.metaValue,
                  { color: theme.colors.text },
                ]}
              >
                {selectedComponent.replacement}
              </Text>
            </View>
          ) : null}
        </View>
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
          Tap the 3D model to inspect its internal components.
        </Text>
      )}
    </View>
  );

  if (!isValidDevice || !deviceType) {
    return (
      <View
        style={[
          styles.screen,
          {
            backgroundColor: theme.colors.background,
            paddingTop: insets.top,
            paddingBottom: insets.bottom,
            paddingHorizontal: 24,
            justifyContent: 'center',
            alignItems: 'center',
          },
        ]}
      >
        <Icon
          name="alert-circle-outline"
          size={52}
          color={theme.colors.error || '#ef5350'}
        />
        <Text
          style={[
            styles.title,
            {
              color: theme.colors.text,
              marginTop: 18,
              textAlign: 'center',
            },
          ]}
        >
          3D Model Unavailable
        </Text>
        <Text
          style={[
            styles.subtitle,
            {
              color: theme.colors.textSecondary,
              marginTop: 8,
              marginBottom: 28,
              textAlign: 'center',
              maxWidth: 320,
              lineHeight: 22,
            },
          ]}
        >
          Unable to load 3D view because the device type was not provided.
        </Text>
        <Pressable
          style={{
            backgroundColor: theme.colors.primary,
            paddingHorizontal: 28,
            paddingVertical: 14,
            borderRadius: theme.radius.md || 10,
          }}
          onPress={() => navigation.goBack()}
        >
          <Text
            style={{
              color: theme.colors.onPrimary || '#FFFFFF',
              fontWeight: '700',
              fontSize: 16,
            }}
          >
            Go Back
          </Text>
        </Pressable>
      </View>
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
            {deviceType === 'pendrive'
              ? 'USB Flash Drive — Exploded View'
              : 'Computer Mouse — Exploded View'}
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
            Representative internal structure
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
              deviceType={deviceType}
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
              deviceType={deviceType}
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

    inspectorHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },

    inspectorLabel: {
      fontSize: 11,
      fontWeight: '800',
      letterSpacing: 1,
    },

    replaceableBadge: {
      borderWidth: 1,
      borderRadius: 8,
      paddingHorizontal: 8,
      paddingVertical: 3,
    },

    replaceableBadgeText: {
      fontSize: 10,
      fontWeight: '800',
      letterSpacing: 0.5,
    },

    componentName: {
      marginTop: 8,
      fontSize: 20,
      fontWeight: '800',
    },

    componentMetaContainer: {
      marginTop: 12,
      gap: 12,
    },

    metaField: {
      gap: 3,
    },

    metaLabel: {
      fontSize: 10,
      fontWeight: '700',
      letterSpacing: 0.8,
    },

    metaValue: {
      fontSize: 13,
      lineHeight: 19,
      fontWeight: '500',
    },

    bulletItem: {
      fontSize: 13,
      lineHeight: 19,
      fontWeight: '500',
      marginLeft: 4,
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
