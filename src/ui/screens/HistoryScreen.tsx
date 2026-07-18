import React, { useCallback, useState } from 'react';
import { FlatList, Image, StyleSheet, Text, TouchableOpacity, View, TextInput, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { listScans, deleteScans, clearAllScans } from '../../storage/localStorage';
import type { StoredScan } from '../../types/dissectra';
import { useTheme } from '../../theme/ThemeProvider';

type FilterType = 'all' | 'complete' | 'processing' | 'failed';



export function HistoryScreen({ navigation }: any) {
  const { theme } = useTheme();
  const styles = makeStyles(theme);
  const [items, setItems] = useState<StoredScan[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
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

  return (
    <View style={styles.screen}>
      <View style={{ paddingHorizontal: theme.spacing.lg }}>
        {selectedIds.length > 0 ? (
          <View style={{ flexDirection: 'row', gap: theme.spacing.md, marginBottom: theme.spacing.md }}>
            <TouchableOpacity style={[styles.secondaryButton, { flex: 1 }]} onPress={async () => { await deleteScans(selectedIds); const all = await listScans(); setItems(all); setSelectedIds([]); }}>
              <Text style={styles.secondaryButtonText}>Delete Selected ({selectedIds.length})</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.secondaryButton, { width: 120 }]} onPress={() => setSelectedIds([])}>
              <Text style={styles.secondaryButtonText}>Clear</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
            <TouchableOpacity style={[styles.secondaryButton, { width: 160 }]} onPress={async () => { await clearAllScans(); setItems([]); }}>
              <Text style={styles.secondaryButtonText}>Clear History</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
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
        renderItem={({ item }) => {
          const selected = selectedIds.includes(item.id);
          return (
            <TouchableOpacity
              style={[styles.item, selected && { borderColor: theme.colors.primary }]}
              onPress={() => navigation.navigate('Home', { scan: item })}
              onLongPress={() => {
                setSelectedIds(prev => prev.includes(item.id) ? prev.filter(id => id !== item.id) : [...prev, item.id]);
              }}
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
          );
        }}
      />
    </View>
  );
}

function makeStyles(themeObj: any) {
  return StyleSheet.create({
    screen: { flex: 1, backgroundColor: themeObj.colors.background },
    header: { paddingHorizontal: themeObj.spacing.lg, paddingTop: themeObj.spacing.lg, paddingBottom: themeObj.spacing.md },
    title: { ...themeObj.typography.h2, color: themeObj.colors.text, marginBottom: themeObj.spacing.xs },
    subtitle: { ...themeObj.typography.body2, color: themeObj.colors.textSecondary },
    searchContainer: { paddingHorizontal: themeObj.spacing.lg, marginBottom: themeObj.spacing.md },
    searchInput: { backgroundColor: themeObj.colors.surfaceVariant, borderRadius: themeObj.radius.md, paddingHorizontal: themeObj.spacing.md, paddingVertical: themeObj.spacing.md, ...themeObj.typography.body1, color: themeObj.colors.text },
    filterContainer: { flexDirection: 'row', paddingHorizontal: themeObj.spacing.lg, marginBottom: themeObj.spacing.md, gap: themeObj.spacing.sm },
    filterPill: { paddingHorizontal: themeObj.spacing.md, paddingVertical: themeObj.spacing.sm, borderRadius: themeObj.radius.full, backgroundColor: themeObj.colors.surfaceVariant, borderWidth: 1, borderColor: themeObj.colors.border },
    filterPillActive: { backgroundColor: themeObj.colors.primary, borderColor: themeObj.colors.primary },
    filterPillText: { ...themeObj.typography.caption, color: themeObj.colors.textSecondary, fontWeight: '500' },
    filterPillTextActive: { color: themeObj.colors.onPrimary },
    list: { flex: 1 },
    listContent: { paddingHorizontal: themeObj.spacing.lg, paddingBottom: themeObj.spacing.lg, gap: themeObj.spacing.md },
    emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: themeObj.spacing.xxl },
    emptyIcon: { fontSize: 64, marginBottom: themeObj.spacing.md },
    emptyTitle: { ...themeObj.typography.h5, color: themeObj.colors.text, marginBottom: themeObj.spacing.xs },
    emptyText: { ...themeObj.typography.body2, color: themeObj.colors.textSecondary, textAlign: 'center', marginBottom: themeObj.spacing.lg },
    emptyButton: { backgroundColor: themeObj.colors.primary, paddingHorizontal: themeObj.spacing.xl, paddingVertical: themeObj.spacing.md, borderRadius: themeObj.radius.md },
    emptyButtonText: { ...themeObj.typography.subtitle1, color: themeObj.colors.onPrimary, fontWeight: '600' },
    item: { flexDirection: 'row', gap: themeObj.spacing.md, padding: themeObj.spacing.md, borderRadius: themeObj.radius.lg, backgroundColor: themeObj.colors.card, borderWidth: 1, borderColor: themeObj.colors.border },
    thumb: { width: 80, height: 80, borderRadius: themeObj.radius.md },
    thumbPlaceholder: { width: 80, height: 80, borderRadius: themeObj.radius.md, backgroundColor: themeObj.colors.surfaceVariant, alignItems: 'center', justifyContent: 'center' },
    thumbPlaceholderText: { fontSize: 32 },
    itemBody: { flex: 1 },
    rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    name: { ...themeObj.typography.subtitle1, color: themeObj.colors.text, fontWeight: '600', flex: 1, marginRight: themeObj.spacing.sm },
    date: { ...themeObj.typography.caption, color: themeObj.colors.textSecondary, marginTop: 2 },
    labels: { ...themeObj.typography.caption, color: themeObj.colors.primary, marginTop: themeObj.spacing.sm },
    status: { ...themeObj.typography.caption, fontWeight: '600', textTransform: 'uppercase', paddingHorizontal: themeObj.spacing.sm, paddingVertical: 2, borderRadius: themeObj.radius.sm },
    ready: { color: themeObj.colors.success, backgroundColor: 'rgba(0, 230, 118, 0.15)' },
    offline: { color: '#FBBF24', backgroundColor: 'rgba(251, 191, 36, 0.15)' },
    failed: { color: themeObj.colors.error, backgroundColor: 'rgba(255, 82, 82, 0.15)' },
    processing: { color: themeObj.colors.secondary, backgroundColor: 'rgba(124, 92, 255, 0.15)' },
    secondaryButton: { paddingVertical: themeObj.spacing.md, paddingHorizontal: themeObj.spacing.md, borderRadius: themeObj.radius.md, backgroundColor: themeObj.colors.surfaceVariant, alignItems: 'center', borderWidth: 1, borderColor: themeObj.colors.border },
    secondaryButtonText: { ...themeObj.typography.subtitle1, color: themeObj.colors.text, fontWeight: '500' },
  });
}
