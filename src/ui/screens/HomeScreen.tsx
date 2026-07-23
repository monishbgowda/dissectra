import React, {
  useCallback,
  useState,
} from 'react';

import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';

import {
  useFocusEffect,
} from '@react-navigation/native';

import {
  listScans,
} from '../../storage/localStorage';

import type {
  StoredScan,
} from '../../types/dissectra';

import {
  useTheme,
} from '../../theme/ThemeProvider';

import {
  Screen,
} from '../components/Screen';

export function HomeScreen({
  navigation,
}: any) {
  const { theme } = useTheme();

  const {
    width,
  } = useWindowDimensions();

  const [recent, setRecent] =
    useState<StoredScan[]>([]);

  const styles = makeStyles(theme);

  useFocusEffect(
    useCallback(() => {
      listScans()
        .then(scans => {
          setRecent(scans.slice(0, 6));
        })
        .catch(() => {
          setRecent([]);
        });
    }, []),
  );

  const horizontalPadding =
    width < 380 ? 18 : 24;

  return (
    <Screen
      scroll
      contentStyle={{
        paddingHorizontal:
          horizontalPadding,
      }}
    >
      {/* Header */}

      <View style={styles.header}>
        <View style={styles.brandBlock}>
          <Text style={styles.brand}>
            DISSECTRA
          </Text>

          <Text style={styles.tagline}>
            See what's inside.
          </Text>
        </View>

        <TouchableOpacity
          accessibilityLabel="Settings"
          style={styles.settingsButton}
          onPress={() =>
            navigation.navigate('Settings')
          }
        >
          <Text style={styles.settingsIcon}>
            ⚙
          </Text>
        </TouchableOpacity>
      </View>

      {/* Hero */}

      <View style={styles.hero}>
        <View style={styles.heroGraphic}>
          <View style={styles.heroOuter}>
            <View style={styles.heroMiddle}>
              <View style={styles.heroInner}>
                <Text style={styles.heroD}>
                  D
                </Text>
              </View>
            </View>
          </View>

          <View
            style={[
              styles.layer,
              styles.layerOne,
            ]}
          />

          <View
            style={[
              styles.layer,
              styles.layerTwo,
            ]}
          />

          <View
            style={[
              styles.layer,
              styles.layerThree,
            ]}
          />
        </View>

        <Text style={styles.heroTitle}>
          Understand any object.
        </Text>

        <Text style={styles.heroDescription}>
          Scan, analyze and explore what is
          inside in interactive 3D.
        </Text>
      </View>

      {/* Primary action */}

      <TouchableOpacity
        activeOpacity={0.88}
        style={styles.scanButton}
        onPress={() =>
          navigation.navigate('Scan')
        }
      >
        <Text style={styles.scanButtonText}>
          SCAN AN OBJECT
        </Text>

        <View style={styles.scanGlyph}>
          <View style={styles.cornerTL} />
          <View style={styles.cornerTR} />
          <View style={styles.cornerBL} />
          <View style={styles.cornerBR} />

          <View style={styles.scanDot} />
        </View>

</TouchableOpacity>

{/* 3D Demo */}

<TouchableOpacity
  activeOpacity={0.85}
  style={styles.demoButton}
  onPress={() => {
    navigation
      .getParent()
      ?.navigate(
        'Demo3D',
        undefined,
      );
  }}
>
  <View
    style={
      styles.demoIconBox
    }
  >
    <Text
      style={
        styles.demoCube
      }
    >
      ◇
    </Text>
  </View>

  <View
    style={
      styles.demoTextBlock
    }
  >
    <Text
      style={
        styles.demoButtonTitle
      }
    >
      TRY 3D DEMO
    </Text>

    <Text
      style={
        styles.demoButtonSubtitle
      }
    >
      Explore an interactive dissection
    </Text>
  </View>

  <Text
    style={
      styles.demoArrow
    }
  >
    ›
  </Text>
</TouchableOpacity>

{/* Recent */}
        
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>
          RECENT DISSECTIONS
        </Text>

        {recent.length > 0 && (
          <TouchableOpacity
            onPress={() =>
              navigation.navigate('History')
            }
          >
            <Text style={styles.viewAll}>
              View all
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {recent.length === 0 ? (
        <TouchableOpacity
          style={styles.emptyRecent}
          onPress={() =>
            navigation.navigate('Scan')
          }
        >
          <Text style={styles.emptyTitle}>
            No dissections yet
          </Text>

          <Text style={styles.emptyText}>
            Your captured objects will appear
            here after your first scan.
          </Text>
        </TouchableOpacity>
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={
            styles.recentRow
          }
        >
          {recent.map(scan => (
            <TouchableOpacity
              key={scan.id}
              activeOpacity={0.85}
              style={styles.recentCard}
              onPress={() =>
                navigation.navigate(
                  'Home',
                  { scan },
                )
              }
            >
              <View
                style={
                  styles.thumbnailContainer
                }
              >
                {scan.imageUri ? (
                  <Image
                    source={{
                      uri: scan.imageUri,
                    }}
                    style={styles.thumbnail}
                    resizeMode="cover"
                  />
                ) : (
                  <View
                    style={
                      styles.thumbnailFallback
                    }
                  >
                    <Text
                      style={
                        styles.fallbackMark
                      }
                    >
                      D
                    </Text>
                  </View>
                )}
              </View>

              <Text
                numberOfLines={1}
                style={styles.recentName}
              >
                {scan.analysis?.object ||
                  'Unknown object'}
              </Text>

              <Text style={styles.recentDate}>
                {formatRelativeDate(
                  scan.createdAt,
                )}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {/* How it works */}

      <View style={styles.howCard}>
        <Text style={styles.howTitle}>
          HOW IT WORKS
        </Text>

        <View style={styles.howRow}>
          <HowItem
            number="01"
            title="SCAN"
            text="Capture any object"
          />

          <View style={styles.howDivider} />

          <HowItem
            number="02"
            title="ANALYZE"
            text="AI identifies components"
          />

          <View style={styles.howDivider} />

          <HowItem
            number="03"
            title="DISSECT"
            text="Explore it in 3D"
          />
        </View>
      </View>
    </Screen>
  );
}

function HowItem({
  number,
  title,
  text,
}: {
  number: string;
  title: string;
  text: string;
}) {
  const { theme } = useTheme();

  return (
    <View style={stylesStatic.howItem}>
      <Text
        style={[
          stylesStatic.howNumber,
          {
            color:
              theme.colors.textSecondary,
          },
        ]}
      >
        {number}
      </Text>

      <Text
        style={[
          stylesStatic.howItemTitle,
          {
            color: theme.colors.text,
          },
        ]}
      >
        {title}
      </Text>

      <Text
        style={[
          stylesStatic.howItemText,
          {
            color:
              theme.colors.textSecondary,
          },
        ]}
      >
        {text}
      </Text>
    </View>
  );
}

function formatRelativeDate(
  value: string | number,
) {
  const date = new Date(value);
  const today = new Date();

  const difference =
    today.setHours(0, 0, 0, 0) -
    new Date(date).setHours(0, 0, 0, 0);

  const days = Math.floor(
    difference / 86400000,
  );

  if (days === 0) {
    return 'Today';
  }

  if (days === 1) {
    return 'Yesterday';
  }

  return date.toLocaleDateString();
}

const stylesStatic =
  StyleSheet.create({
    howItem: {
      flex: 1,
      alignItems: 'center',
      paddingHorizontal: 4,
    },

    howNumber: {
      fontSize: 10,
      fontWeight: '600',
      marginBottom: 8,
    },

    howItemTitle: {
      fontSize: 12,
      fontWeight: '700',
      marginBottom: 5,
    },

    howItemText: {
      fontSize: 11,
      lineHeight: 15,
      textAlign: 'center',
    },
  });

function makeStyles(theme: any) {
  return StyleSheet.create({
    header: {
      paddingTop: 12,
      paddingBottom: 20,

      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
    },

    brandBlock: {
      flexShrink: 1,
    },

    brand: {
      color: theme.colors.text,

      fontSize: 25,
      lineHeight: 30,

      fontWeight: '800',
      letterSpacing: 0.4,
    },

    tagline: {
      color:
        theme.colors.textSecondary,

      fontSize: 14,

      marginTop: 2,
    },

    settingsButton: {
      width: 42,
      height: 42,

      borderRadius: 21,

      alignItems: 'center',
      justifyContent: 'center',
    },

    settingsIcon: {
      color: theme.colors.text,
      fontSize: 22,
    },

    hero: {
      minHeight: 300,

      borderRadius: 22,

      backgroundColor:
        theme.colors.surfaceVariant,

      alignItems: 'center',
      justifyContent: 'center',

      overflow: 'hidden',

      paddingHorizontal: 24,
      paddingVertical: 28,

      marginBottom: 16,
    },

    heroGraphic: {
      width: 170,
      height: 155,

      alignItems: 'center',
      justifyContent: 'center',

      marginBottom: 14,
    },

    heroOuter: {
      width: 130,
      height: 130,

      borderWidth: 1,
      borderColor: theme.colors.border,

      borderRadius: 32,

      alignItems: 'center',
      justifyContent: 'center',

      transform: [
        {
          rotate: '-8deg',
        },
      ],
    },

    heroMiddle: {
      width: 100,
      height: 100,

      borderWidth: 1,
      borderColor: theme.colors.border,

      borderRadius: 27,

      alignItems: 'center',
      justifyContent: 'center',
    },

    heroInner: {
      width: 72,
      height: 72,

      borderRadius: 22,

      backgroundColor:
        theme.colors.inverseBackground,

      alignItems: 'center',
      justifyContent: 'center',
    },

    heroD: {
      color:
        theme.colors.inverseText,

      fontSize: 45,
      fontWeight: '900',
    },

    layer: {
      position: 'absolute',

      height: 3,

      borderRadius: 99,

      backgroundColor:
        theme.colors.text,
    },

    layerOne: {
      width: 66,
      top: 61,
      left: 8,
    },

    layerTwo: {
      width: 53,
      top: 75,
      left: 14,
    },

    layerThree: {
      width: 40,
      top: 89,
      left: 20,
    },

    heroTitle: {
      color: theme.colors.text,

      fontSize: 18,
      fontWeight: '700',

      textAlign: 'center',
    },

    heroDescription: {
      color:
        theme.colors.textSecondary,

      fontSize: 13,
      lineHeight: 19,

      textAlign: 'center',

      marginTop: 6,

      maxWidth: 280,
    },

    scanButton: {
      minHeight: 58,

      borderRadius: 15,

      backgroundColor:
        theme.colors.inverseBackground,

      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',

      paddingHorizontal: 20,

      marginBottom: 10,

      ...theme.shadows.sm,
    },

    scanButtonText: {
      color:
        theme.colors.inverseText,

      fontSize: 13,
      fontWeight: '800',

      letterSpacing: 0.4,
    },

    scanGlyph: {
      position: 'absolute',

      right: 18,

      width: 24,
      height: 24,
    },

    cornerTL: {
      position: 'absolute',
      left: 0,
      top: 0,

      width: 8,
      height: 8,

      borderLeftWidth: 1.5,
      borderTopWidth: 1.5,

      borderColor:
        theme.colors.inverseText,
    },

    cornerTR: {
      position: 'absolute',
      right: 0,
      top: 0,

      width: 8,
      height: 8,

      borderRightWidth: 1.5,
      borderTopWidth: 1.5,

      borderColor:
        theme.colors.inverseText,
    },

    cornerBL: {
      position: 'absolute',
      left: 0,
      bottom: 0,

      width: 8,
      height: 8,

      borderLeftWidth: 1.5,
      borderBottomWidth: 1.5,

      borderColor:
        theme.colors.inverseText,
    },

    cornerBR: {
      position: 'absolute',
      right: 0,
      bottom: 0,

      width: 8,
      height: 8,

      borderRightWidth: 1.5,
      borderBottomWidth: 1.5,

      borderColor:
        theme.colors.inverseText,
    },

    scanDot: {
      position: 'absolute',

      width: 6,
      height: 6,

      borderRadius: 3,

      left: 9,
      top: 9,

      backgroundColor:
        theme.colors.inverseText,
    },
demoButton: {
  minHeight: 68,

  borderRadius: 15,

  borderWidth: 1,

  borderColor:
    theme.colors.border,

  backgroundColor:
    theme.colors.card,

  flexDirection: 'row',

  alignItems: 'center',

  paddingHorizontal: 14,

  marginBottom: 28,
},

demoIconBox: {
  width: 42,

  height: 42,

  borderRadius: 12,

  backgroundColor:
    theme.colors
      .surfaceVariant,

  alignItems: 'center',

  justifyContent: 'center',

  marginRight: 12,
},

demoCube: {
  color:
    theme.colors.text,

  fontSize: 27,

  fontWeight: '400',

  lineHeight: 30,
},

demoTextBlock: {
  flex: 1,
},

demoButtonTitle: {
  color:
    theme.colors.text,

  fontSize: 12,

  fontWeight: '800',

  letterSpacing: 0.5,
},

demoButtonSubtitle: {
  color:
    theme.colors
      .textSecondary,

  fontSize: 11,

  marginTop: 4,
},

demoArrow: {
  color:
    theme.colors.text,

  fontSize: 27,

  fontWeight: '300',

  marginLeft: 10,
},
    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',

      marginBottom: 13,
    },

    sectionTitle: {
      color: theme.colors.text,

      fontSize: 12,
      fontWeight: '800',

      letterSpacing: 0.3,
    },

    viewAll: {
      color:
        theme.colors.textSecondary,

      fontSize: 12,
    },

    recentRow: {
      gap: 12,

      paddingBottom: 28,
    },

    recentCard: {
      width: 128,
    },

    thumbnailContainer: {
      width: '100%',
      aspectRatio: 0.98,

      borderRadius: 14,

      overflow: 'hidden',

      backgroundColor:
        theme.colors.surfaceVariant,

      borderWidth: 1,
      borderColor: theme.colors.border,
    },

    thumbnail: {
      width: '100%',
      height: '100%',
    },

    thumbnailFallback: {
      flex: 1,

      alignItems: 'center',
      justifyContent: 'center',
    },

    fallbackMark: {
      color:
        theme.colors.textSecondary,

      fontSize: 42,
      fontWeight: '800',
    },

    recentName: {
      color: theme.colors.text,

      fontSize: 13,
      fontWeight: '600',

      marginTop: 9,
    },

    recentDate: {
      color:
        theme.colors.textSecondary,

      fontSize: 11,

      marginTop: 3,
    },

    emptyRecent: {
      minHeight: 115,

      borderRadius: 16,

      borderWidth: 1,
      borderColor: theme.colors.border,

      backgroundColor:
        theme.colors.card,

      justifyContent: 'center',

      padding: 20,

      marginBottom: 28,
    },

    emptyTitle: {
      color: theme.colors.text,

      fontSize: 15,
      fontWeight: '600',
    },

    emptyText: {
      color:
        theme.colors.textSecondary,

      fontSize: 13,
      lineHeight: 19,

      marginTop: 5,
    },

    howCard: {
      borderRadius: 18,

      backgroundColor:
        theme.colors.card,

      borderWidth: 1,
      borderColor: theme.colors.border,

      padding: 18,

      marginBottom: 20,
    },

    howTitle: {
      color: theme.colors.text,

      fontSize: 11,
      fontWeight: '800',

      letterSpacing: 0.5,

      marginBottom: 20,
    },

    howRow: {
      flexDirection: 'row',
      alignItems: 'stretch',
    },

    howDivider: {
      width: 1,

      backgroundColor:
        theme.colors.divider,

      marginHorizontal: 8,
    },
  });
}