import React, { useCallback, useState } from 'react';
import { FlatList, Image, StyleSheet, Text, TouchableOpacity, View, TextInput } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { listScans } from '../../storage/localStorage';
import type { StoredScan } from '../../types/dissectra';
import { theme } from '../../theme/theme';

type FilterType = 'all' | 'complete' | 'processing' | 'failed';

function statusBadgeLabel(status: StoredScan['status']) {
  if (status === 'offline') return 'OFFLINE';
  if (status === 'failed') return 'FAILED';
  if (status === 'processing') return 'PROCESSING';
  return 'COMPLETE';
}

function statusBadgeStyle(status: StoredScan['status']) {
  if (status === 'complete') return styles.ready;
  if (status === 'offline') return styles.offline;
  if (status === 'failed') return styles.failed;
  return styles.processing;
}

export function HistoryScreen({ navigation }: any) {
  const [items, setItems] = useState<StoredScan[]>([]);
  const [filteredItems, setFilteredItems] = useState<StoredScan[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');

  useFocusEffect(useCallback(() => {
    listScans().then(setItems);
  }, []));

  React.useEffect(() => {
    let filtered = items;

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(item =>
        item.analysis.object.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.analysis.labels.some(label => label.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Apply status filter
    if (activeFilter !== 'all') {
      filtered = filtered.filter(item => item.status === activeFilter);
    }

    setFilteredItems(filtered);
  }, [items, searchQuery, activeFilter]);

  const filters: { key: FilterType; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'complete', label: 'Complete' },
    { key: 'processing', label: 'Processing' },
    { key: 'failed', label: 'Failed' },
  ];

  return (
    <View style={styles.screen}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Scan History</Text>
        <Text style={styles.subtitle}>{items.length} scans total</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search scans..."
          placeholderTextColor={theme.colors.textDisabled}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Filter Pills */}
      <View style={styles.filterContainer}>
        {filters.map(filter => (
          <TouchableOpacity
            key={filter.key}
            style={[
              styles.filterPill,
              activeFilter === filter.key && styles.filterPillActive,
            ]}
            onPress={() => setActiveFilter(filter.key)}
          >
            <Text
              style={[
                styles.filterPillText,
                activeFilter === filter.key && styles.filterPillTextActive,
              ]}
            >
              {filter.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* List */}
      <FlatList
        style={styles.list}
        contentContainerStyle={styles.listContent}
        data={filteredItems}
        keyExtractor={i => i.id}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📭</Text>
            <Text style={styles.emptyTitle}>
              {searchQuery ? 'No matching scans' : 'No scans yet'}
            </Text>
            <Text style={styles.emptyText}>
              {searchQuery
                ? 'Try a different search term'
                : 'Start by scanning an object to build your history'}
            </Text>
            {!searchQuery && (
              <TouchableOpacity
                style={styles.emptyButton}
                onPress={() => navigation.navigate('Scan')}
              >
                <Text style={styles.emptyButtonText}>Start Scanning</Text>
              </TouchableOpacity>
            )}
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.item}
            onPress={() => navigation.navigate('Home', { scan: item })}
          >
            {item.imageUri ? (
              <Image source={{ uri: item.imageUri }} style={styles.thumb} />
            ) : (
              <View style={styles.thumbPlaceholder}>
                <Text style={styles.thumbPlaceholderText}>📷</Text>
              </View>
            )}
            <View style={styles.itemBody}>
              <View style={styles.rowBetween}>
                <Text style={styles.name} numberOfLines={1}>
                  {item.analysis.object}
                </Text>
                <Text
                  style={[styles.status, statusBadgeStyle(item.status)]}
                >
                  {statusBadgeLabel(item.status)}
                </Text>
              </View>
              <Text style={styles.date}>
                {new Date(item.createdAt).toLocaleDateString()}
              </Text>
              <Text style={styles.labels} numberOfLines={1}>
                {item.analysis.labels.join(' • ')}
              </Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: theme.colors.background },
  header: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
  },
  title: {
    ...theme.typography.h2,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    ...theme.typography.body2,
    color: theme.colors.textSecondary,
  },
  searchContainer: {
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  searchInput: {
    backgroundColor: theme.colors.surfaceVariant,
    borderRadius: theme.radius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    ...theme.typography.body1,
    color: theme.colors.text,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  filterPill: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.surfaceVariant,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  filterPillActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  filterPillText: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  filterPillTextActive: {
    color: theme.colors.onPrimary,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.xxl,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: theme.spacing.md,
  },
  emptyTitle: {
    ...theme.typography.h5,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  emptyText: {
    ...theme.typography.body2,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
  },
  emptyButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.radius.md,
  },
  emptyButtonText: {
    ...theme.typography.subtitle1,
    color: theme.colors.onPrimary,
    fontWeight: '600',
  },
  item: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    padding: theme.spacing.md,
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  thumb: {
    width: 80,
    height: 80,
    borderRadius: theme.radius.md,
  },
  thumbPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.surfaceVariant,
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbPlaceholderText: {
    fontSize: 32,
  },
  itemBody: {
    flex: 1,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  name: {
    ...theme.typography.subtitle1,
    color: theme.colors.text,
    fontWeight: '600',
    flex: 1,
    marginRight: theme.spacing.sm,
  },
  date: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  labels: {
    ...theme.typography.caption,
    color: theme.colors.primary,
    marginTop: theme.spacing.sm,
  },
  status: {
    ...theme.typography.caption,
    fontWeight: '600',
    textTransform: 'uppercase',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    borderRadius: theme.radius.sm,
  },
  ready: {
    color: theme.colors.success,
    backgroundColor: 'rgba(0, 230, 118, 0.15)',
  },
  offline: {
    color: '#FBBF24',
    backgroundColor: 'rgba(251, 191, 36, 0.15)',
  },
  failed: {
    color: theme.colors.error,
    backgroundColor: 'rgba(255, 82, 82, 0.15)',
  },
  processing: {
    color: theme.colors.secondary,
    backgroundColor: 'rgba(124, 92, 255, 0.15)',
  },
});
