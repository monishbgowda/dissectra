import React, {
  useCallback,
  useMemo,
  useState,
} from 'react';

import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import {
  useFocusEffect,
} from '@react-navigation/native';

import {
  SafeAreaView,
} from 'react-native-safe-area-context';

import {
  listInspections,
  deleteInspection,
} from '../../storage/inspectionStorage';

import type {
  Inspection,
} from '../../storage/inspectionTypes';

import {
  useTheme,
} from '../../theme/ThemeProvider';

import type {
  CompositeScreenProps,
} from "@react-navigation/native";

import type {
  BottomTabScreenProps,
} from "@react-navigation/bottom-tabs";

import type {
  NativeStackScreenProps,
} from "@react-navigation/native-stack";

import type {
  RootTabParamList,
  RootStackParamList,
} from "../../types/navigation";

type Props = CompositeScreenProps<
  BottomTabScreenProps<
    RootTabParamList,
    "History"
  >,
  NativeStackScreenProps<
    RootStackParamList
  >
>;

export function HistoryScreen({
  navigation,
}: Props)  {
  const { theme } = useTheme();

  const styles = makeStyles(theme);

  const [history, setHistory] =
    useState<Inspection[]>([]);

  const [searchVisible, setSearchVisible] =
    useState(false);

  const [query, setQuery] =
    useState('');

const [filter, setFilter] =
useState<
'ALL' |
'COMPLETED' |
'PROCESSING' |
'FAILED'
>('ALL');

  useFocusEffect(
    useCallback(() => {
        loadHistory();
    }, []),
);
async function loadHistory(): Promise<void> {
  const inspections =
    await listInspections();

  inspections.sort(
    (a, b) =>
      new Date(b.createdAt).getTime() -
      new Date(a.createdAt).getTime(),
  );

  setHistory(inspections);
}
async function removeInspection(
  id: string,
): Promise<void> {
  await deleteInspection(id);

  await loadHistory();
}

  const filtered = useMemo(() => {
    return history.filter(item => {
      const object =
    item.objectName || '';

      const matchesSearch =
        object
          .toLowerCase()
          .includes(
            query.toLowerCase(),
          );

      const matchesFilter =
        filter === 'ALL' ||
        item.status === filter;

      return (
        matchesSearch &&
        matchesFilter
      );
    });
}, [history, query, filter]);

  return (
    <SafeAreaView
      edges={[
        'top',
        'left',
        'right',
      ]}
      style={styles.safe}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>
            History
          </Text>

          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() =>
                setSearchVisible(
                  current => !current,
                )
              }
            >
              <Text
                style={styles.searchIcon}
              >
                ⌕
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.iconButton}
            >
              <Text style={styles.more}>
                ⋮
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {searchVisible && (
          <View style={styles.searchWrap}>
            <TextInput
              autoFocus
              value={query}
              onChangeText={setQuery}
              placeholder="Search history"
              placeholderTextColor={
                theme.colors.textDisabled
              }
              style={styles.search}
            />
          </View>
        )}

        <View style={styles.filters}>
          <FilterButton
            label="All"
            active={filter === 'ALL'}
            onPress={() =>
              setFilter('ALL')
            }
          />

          <FilterButton
            label="Complete"
            active={
              filter === 'COMPLETED'
            }
            onPress={() =>
              setFilter('COMPLETED')
            }
          />

          <FilterButton
            label="Processing"
            active={
              filter === 'PROCESSING'
            }
            onPress={() =>
              setFilter('PROCESSING')
            }
          />

          <FilterButton
            label="Failed"
            active={
              filter === 'FAILED'
            }
            onPress={() =>
              setFilter('FAILED')
            }
          />
        </View>

        <FlatList
          data={filtered}
          keyExtractor={item => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={
            styles.listContent
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyTitle}>
                No inspections yet
              </Text>

              <Text style={styles.emptyText}>
                Your completed inspections
                will appear here.
              </Text>

              <TouchableOpacity
                style={styles.emptyButton}
                onPress={() =>
                  navigation.navigate(
                    'Scan',
                  )
                }
              >
                <Text
                  style={
                    styles.emptyButtonText
                  }
                >
                  SCAN AN OBJECT
                </Text>
              </TouchableOpacity>
            </View>
          }
          renderItem={({ item }) => {

    const statusColor =
        item.status === "COMPLETED"
            ? theme.colors.success
            : item.status === "FAILED"
            ? theme.colors.error
            : theme.colors.warning;

    return (
        <TouchableOpacity
            activeOpacity={0.85}
            style={styles.card}
            onPress={() =>
                navigation.navigate(
                    "InspectionDetails",
                    {
                        inspectionId: item.id,
                    },
                )
            }
        >
            {/* Everything that was already inside your TouchableOpacity stays exactly the same */}

            {item.thumbnail ? (
                <Image
                    source={{ uri: item.thumbnail }}
                    style={styles.image}
                />
            ) : (
                <View style={styles.imagePlaceholder}>
                    <Text style={styles.placeholderD}>
                        D
                    </Text>
                </View>
            )}

            <View style={styles.body}>
                <Text
                    style={styles.name}
                    numberOfLines={1}
                >
                    {item.objectName ||
                        "Unknown object"}
                </Text>

                <Text
                    style={styles.parts}
                    numberOfLines={1}
                >
                    {item.imageCount} Images
                </Text>

                <Text style={styles.parts}>
                    Confidence:
                    {item.confidence
                        ? ` ${Math.round(
                              item.confidence *
                                  100,
                          )}%`
                        : " --"}
                </Text>

                <Text
                    style={[
                        styles.parts,
                        {
                            color: statusColor,
                        },
                    ]}
                >
                    {item.status}
                </Text>

                <Text style={styles.date}>
                    {new Date(
                        item.createdAt,
                    ).toLocaleString()}
                </Text>
            </View>

            <Text style={styles.chevron}>
                ›
            </Text>
        </TouchableOpacity>
    );
}}
        />
      </View>
    </SafeAreaView>
  );
}

function FilterButton({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  const { theme } = useTheme();

  return (
    <TouchableOpacity
      style={[
        filterStyles.button,
        {
          backgroundColor: active
            ? theme.colors.inverseBackground
            : theme.colors.surfaceVariant,

          borderColor: active
            ? theme.colors.inverseBackground
            : theme.colors.border,
        },
      ]}
      onPress={onPress}
    >
      <Text
        style={[
          filterStyles.text,
          {
            color: active
              ? theme.colors.inverseText
              : theme.colors.textSecondary,
          },
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}



const filterStyles =
  StyleSheet.create({
    button: {
      paddingHorizontal: 14,
      minHeight: 34,

      borderRadius: 17,

      borderWidth: 1,

      justifyContent: 'center',
      alignItems: 'center',
    },

    text: {
      fontSize: 12,
      fontWeight: '500',
    },
  });

function makeStyles(theme: any) {
  return StyleSheet.create({
    safe: {
      flex: 1,

      backgroundColor:
        theme.colors.background,
    },

    container: {
      flex: 1,

      width: '100%',
      maxWidth: 720,

      alignSelf: 'center',
    },

    header: {
      minHeight: 66,

      paddingHorizontal: 20,

      flexDirection: 'row',

      alignItems: 'center',
      justifyContent: 'space-between',

      borderBottomWidth: 1,
      borderBottomColor:
        theme.colors.divider,
    },

    title: {
      color: theme.colors.text,

      fontSize: 22,
      fontWeight: '700',
    },

    headerActions: {
      flexDirection: 'row',

      alignItems: 'center',

      gap: 4,
    },

    iconButton: {
      width: 42,
      height: 42,

      alignItems: 'center',
      justifyContent: 'center',

      borderRadius: 21,
    },

    searchIcon: {
      color: theme.colors.text,

      fontSize: 27,
      lineHeight: 29,
    },

    more: {
      color: theme.colors.text,

      fontSize: 25,
      lineHeight: 27,
    },

    searchWrap: {
      paddingHorizontal: 20,
      paddingTop: 14,
    },

    search: {
      minHeight: 46,

      borderRadius: 13,

      paddingHorizontal: 15,

      color: theme.colors.text,

      backgroundColor:
        theme.colors.input,

      borderWidth: 1,
      borderColor: theme.colors.border,

      fontSize: 14,
    },

    filters: {
      flexDirection: 'row',

      paddingHorizontal: 20,

      paddingTop: 16,
      paddingBottom: 14,

      gap: 8,
    },

    listContent: {
      paddingHorizontal: 20,

      paddingBottom: 32,

      gap: 10,

      flexGrow: 1,
    },

    card: {
      minHeight: 94,

      flexDirection: 'row',

      alignItems: 'center',

      padding: 9,

      borderRadius: 16,

      backgroundColor:
        theme.colors.card,

      borderWidth: 1,
      borderColor: theme.colors.border,

      ...theme.shadows.sm,
    },

    image: {
      width: 78,
      height: 74,

      borderRadius: 11,

      backgroundColor:
        theme.colors.surfaceVariant,
    },

    imagePlaceholder: {
      width: 78,
      height: 74,

      borderRadius: 11,

      backgroundColor:
        theme.colors.surfaceVariant,

      alignItems: 'center',
      justifyContent: 'center',
    },

    placeholderD: {
      color:
        theme.colors.textSecondary,

      fontSize: 30,
      fontWeight: '800',
    },

    body: {
      flex: 1,

      minWidth: 0,

      paddingHorizontal: 14,
    },

    name: {
      color: theme.colors.text,

      fontSize: 15,
      fontWeight: '600',
    },

    parts: {
      color:
        theme.colors.textSecondary,

      fontSize: 12,

      marginTop: 5,
    },

    date: {
      color:
        theme.colors.textSecondary,

      fontSize: 11,

      marginTop: 3,
    },

    chevron: {
      color:
        theme.colors.textSecondary,

      fontSize: 26,

      paddingRight: 6,
    },

    empty: {
      flex: 1,

      minHeight: 400,

      alignItems: 'center',
      justifyContent: 'center',

      paddingHorizontal: 32,
    },

    emptyTitle: {
      color: theme.colors.text,

      fontSize: 18,
      fontWeight: '600',
    },

    emptyText: {
      color:
        theme.colors.textSecondary,

      fontSize: 13,
      lineHeight: 19,

      textAlign: 'center',

      marginTop: 7,
      marginBottom: 22,
    },

    emptyButton: {
      minHeight: 48,

      paddingHorizontal: 24,

      borderRadius: 13,

      alignItems: 'center',
      justifyContent: 'center',

      backgroundColor:
        theme.colors.inverseBackground,
    },

    emptyButtonText: {
      color:
        theme.colors.inverseText,

      fontSize: 12,
      fontWeight: '700',
    },
  });
}