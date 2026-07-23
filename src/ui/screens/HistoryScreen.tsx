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
  listScans,
} from '../../storage/localStorage';

import type {
  StoredScan,
} from '../../types/dissectra';

import {
  useTheme,
} from '../../theme/ThemeProvider';

type Filter =
  | 'all'
  | 'complete'
  | 'processing'
  | 'failed';

export function HistoryScreen({
  navigation,
}: any) {
  const { theme } = useTheme();

  const styles = makeStyles(theme);

  const [items, setItems] =
    useState<StoredScan[]>([]);

  const [searchVisible, setSearchVisible] =
    useState(false);

  const [query, setQuery] =
    useState('');

  const [filter, setFilter] =
    useState<Filter>('all');

  useFocusEffect(
    useCallback(() => {
      listScans().then(setItems);
    }, []),
  );

  const filtered = useMemo(() => {
    return items.filter(item => {
      const object =
        item.analysis?.object || '';

      const matchesSearch =
        object
          .toLowerCase()
          .includes(
            query.toLowerCase(),
          );

      const matchesFilter =
        filter === 'all' ||
        item.status === filter;

      return (
        matchesSearch &&
        matchesFilter
      );
    });
  }, [items, query, filter]);

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
            active={filter === 'all'}
            onPress={() =>
              setFilter('all')
            }
          />

          <FilterButton
            label="Complete"
            active={
              filter === 'complete'
            }
            onPress={() =>
              setFilter('complete')
            }
          />

          <FilterButton
            label="Processing"
            active={
              filter === 'processing'
            }
            onPress={() =>
              setFilter('processing')
            }
          />

          <FilterButton
            label="Failed"
            active={
              filter === 'failed'
            }
            onPress={() =>
              setFilter('failed')
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
                No scans yet
              </Text>

              <Text style={styles.emptyText}>
                Captured objects and their
                snapshots will appear here.
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
          renderItem={({ item }) => (
            <TouchableOpacity
              activeOpacity={0.85}
              style={styles.card}
              onPress={() =>
                navigation.navigate(
                  'Home',
                  { scan: item },
                )
              }
            >
              {item.imageUri ? (
                <Image
                  source={{
                    uri: item.imageUri,
                  }}
                  style={styles.image}
                />
              ) : (
                <View
                  style={
                    styles.imagePlaceholder
                  }
                >
                  <Text
                    style={
                      styles.placeholderD
                    }
                  >
                    D
                  </Text>
                </View>
              )}

              <View style={styles.body}>
                <Text
                  style={styles.name}
                  numberOfLines={1}
                >
                  {item.analysis?.object ||
                    'Unknown object'}
                </Text>

                <Text
                  style={styles.parts}
                  numberOfLines={1}
                >
                  {getPartCount(item)}
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
          )}
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

function getPartCount(
  item: StoredScan,
) {
  const analysis: any =
    item.analysis;

  if (
    Array.isArray(
      analysis?.components,
    )
  ) {
    return `${analysis.components.length} Parts`;
  }

  if (
    Array.isArray(analysis?.labels)
  ) {
    return `${analysis.labels.length} Parts`;
  }

  return item.status === 'complete'
    ? 'Completed'
    : item.status;
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