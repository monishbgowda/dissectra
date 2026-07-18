import React, { useState } from 'react';
import { Alert, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View, Platform, PermissionsAndroid } from 'react-native';
import { launchCamera, launchImageLibrary, ImageLibraryOptions, CameraOptions } from 'react-native-image-picker';
import { GlassCard } from '../components/GlassCard';
import { LoadingState } from '../components/LoadingState';
import { runScanPipeline } from '../../services/scanPipeline';
import { copyToStorage, saveScan } from '../../storage/localStorage';
import type { StoredScan } from '../../types/dissectra';
// small local uuid generator to avoid extra dependency
function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.floor(Math.random() * 16);
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
import { MAX_IMAGE_BYTES } from '../../config/env';
import { useTheme } from '../../theme/ThemeProvider';

interface ImageAssetInfo {
  uri: string;
  fileName?: string;
  fileSize?: number;
  type?: string;
}

export function CaptureScreen({ navigation }: any) {
  const { theme } = useTheme();
  const [asset, setAsset] = useState<ImageAssetInfo | null>(null);
  const [selectedCount, setSelectedCount] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [assets, setAssets] = useState<ImageAssetInfo[]>([]);
  const styles = makeStyles(theme);

  const options: ImageLibraryOptions & CameraOptions = {
    mediaType: 'photo',
    quality: 0.8,
    maxWidth: 1920,
    maxHeight: 1920,
    saveToPhotos: false,
  };

  async function pick(kind: 'camera' | 'gallery') {
    try {
      if (kind === 'camera' && Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.CAMERA);
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          Alert.alert('Permission required', 'Camera permission is required to capture images.');
          return;
        }
      }

      const pickerOptions = { ...options } as any;
      if (kind === 'gallery') {
        // allow multi-selection from gallery (0 = unlimited)
        pickerOptions.selectionLimit = 0;
      }

      const result =
        kind === 'camera'
          ? await launchCamera(pickerOptions)
          : await launchImageLibrary(pickerOptions);

      const assetsFound = result.assets || [];
      const assetItem = assetsFound[0];

      setSelectedCount(assetsFound.length);
      const mapped = assetsFound.map(a => ({ uri: a.uri!, fileName: a.fileName, fileSize: a.fileSize, type: a.type }));
      setAssets(mapped);

      if (!assetItem?.uri) return;
      if (assetItem.fileSize && assetItem.fileSize > MAX_IMAGE_BYTES) {
        Alert.alert('Image too large', `Please choose an image smaller than ${Math.round(MAX_IMAGE_BYTES / 1024 / 1024)} MB.`);
        return;
      }
      setAsset({ uri: assetItem.uri, fileName: assetItem.fileName, fileSize: assetItem.fileSize, type: assetItem.type });
    } catch (error: any) {
      Alert.alert('Image selection failed', error.message || 'Please try again.');
    }
  }

  async function multiCapture(maxCount = 0) {
    const collected: ImageAssetInfo[] = [];
      try {
        if (Platform.OS === 'android') {
          const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.CAMERA);
          if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
            Alert.alert('Permission required', 'Camera permission is required to capture images.');
            return;
          }
        }

        let keepGoing = true;
        while (keepGoing) {
          const res = await launchCamera(options);
          const a = res.assets?.[0];
          if (!a || res.didCancel) break;
          if (a.fileSize && a.fileSize > MAX_IMAGE_BYTES) {
            Alert.alert('Image too large', `Please choose an image smaller than ${Math.round(MAX_IMAGE_BYTES / 1024 / 1024)} MB.`);
            break;
          }
          collected.push({ uri: a.uri!, fileName: a.fileName, fileSize: a.fileSize, type: a.type });
          if (maxCount > 0 && collected.length >= maxCount) break;

          // ask user if they want to take another
          const another = await new Promise<boolean>((resolve) => {
            Alert.alert('Take another?', 'Capture another photo?', [
              { text: 'Yes', onPress: () => resolve(true) },
              { text: 'No', onPress: () => resolve(false) },
            ], { cancelable: true });
          });
          keepGoing = !!another;
        }

        if (collected.length > 0) {
          setAssets(collected);
          setSelectedCount(collected.length);
          setAsset(collected[0]);
        }
      } catch (err: any) {
        Alert.alert('Capture failed', err.message || 'Please try again.');
      }
    }
  async function process() {
    if (assets.length === 0) return;
    setLoading(true);
    try {
      const storedIds: string[] = [];
      for (const a of assets) {
        const id = uuidv4();
        const ext = a.fileName?.split('.').pop() || 'jpg';
        const filename = `${id}.${ext}`;
        const localPath = await copyToStorage(a.uri, 'images', filename);
        const scan: StoredScan = {
          id,
          imageUri: a.uri,
          localImagePath: localPath,
          modelUri: null,
          localModelPath: null,
          analysis: { object: 'Unknown', labels: [] },
          createdAt: new Date().toISOString(),
          status: 'processing',
        };
        await saveScan(scan);
        storedIds.push(id);
      }
      // run pipeline on first image for immediate UX
      const first = assets[0];
      const result = await runScanPipeline(first.uri);
      // merge result into stored scan
      const firstId = storedIds[0];
      const updated: StoredScan = {
        id: firstId,
        imageUri: first.uri,
        localImagePath: undefined,
        modelUri: null,
        localModelPath: null,
        analysis: result.analysis || { object: 'Unknown', labels: [] },
        createdAt: new Date().toISOString(),
        status: 'complete',
      };
      await saveScan(updated);
      navigation.navigate('Home', { scan: result });
    } catch (error: any) {
      Alert.alert('Processing failed', error.message || 'Scan cached locally, try again later.');
    } finally {
      setLoading(false);
    }
  }

  function clearSelection() {
    setAsset(null);
    setAssets([]);
    setSelectedCount(0);
  }

  function removeAssetAt(index: number) {
    const next = assets.slice();
    next.splice(index, 1);
    setAssets(next);
    setSelectedCount(next.length);
    setAsset(next[0] || null);
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Scan Object</Text>
      <Text style={styles.subtitle}>Capture or upload an image for AI analysis</Text>

      <GlassCard variant="elevated">
        {asset ? (
          <View style={styles.previewContainer}>
            <Image source={{ uri: asset.uri }} style={styles.preview} resizeMode="cover" />
            <TouchableOpacity style={styles.clearButton} onPress={clearSelection}>
              <Text style={styles.clearButtonText}>✕</Text>
            </TouchableOpacity>
            <View style={styles.imageInfo}>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>File</Text>
                <Text style={styles.infoValue}>{asset.fileName || 'image.jpg'}</Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Size</Text>
                <Text style={styles.infoValue}>{asset.fileSize ? `${Math.round(asset.fileSize / 1024)} KB` : 'Unknown'}</Text>
              </View>
            </View>
            {assets.length > 1 && (
              <ScrollView horizontal style={styles.thumbRow} contentContainerStyle={{ gap: theme.spacing.sm }}>
                {assets.map((a, i) => (
                  <View key={i} style={styles.thumbWrap}>
                    <Image source={{ uri: a.uri }} style={styles.thumbSmall} />
                    <TouchableOpacity style={styles.thumbRemove} onPress={() => removeAssetAt(i)}>
                      <Text style={styles.thumbRemoveText}>✕</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </ScrollView>
            )}
          </View>
        ) : (
          <View style={styles.placeholder}>
            <Text style={styles.placeholderIcon}>📷</Text>
            <Text style={styles.placeholderTitle}>No Image Selected</Text>
            {selectedCount > 1 && (
              <Text style={styles.selectedCount}>{selectedCount} images selected</Text>
            )}
            <Text style={styles.placeholderText}>
              Capture a photo or choose from your gallery to begin analysis
            </Text>
          </View>
        )}

        <View style={styles.actionRow}>
          <TouchableOpacity 
            style={styles.secondaryButton} 
            onPress={() => pick('camera')}
            disabled={loading}
          >
            <Text style={styles.secondaryButtonText}>📷 Camera</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.secondaryButton} 
            onPress={() => multiCapture()}
            disabled={loading}
          >
            <Text style={styles.secondaryButtonText}>📷 Camera (multi)</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.secondaryButton} 
            onPress={() => pick('gallery')}
            disabled={loading}
          >
            <Text style={styles.secondaryButtonText}>🖼️ Gallery</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          disabled={assets.length === 0 || loading} 
          style={[styles.primaryButton, (!asset?.uri || loading) && styles.disabled]} 
          onPress={process}
        >
          <Text style={styles.primaryButtonText}>
            {loading ? 'Processing...' : 'Analyze & Generate 3D'}
          </Text>
        </TouchableOpacity>
      </GlassCard>

      {/* Tips Section */}
      <GlassCard variant="elevated">
        <Text style={styles.tipsTitle}>Tips for Best Results</Text>
        <View style={styles.tipItem}>
          <Text style={styles.tipIcon}>💡</Text>
          <Text style={styles.tipText}>Use good lighting for clear images</Text>
        </View>
        <View style={styles.tipItem}>
          <Text style={styles.tipIcon}>📐</Text>
          <Text style={styles.tipText}>Capture objects from multiple angles</Text>
        </View>
        <View style={styles.tipItem}>
          <Text style={styles.tipIcon}>🎯</Text>
          <Text style={styles.tipText}>Ensure the object is centered in frame</Text>
        </View>
      </GlassCard>

      {loading && (
        <View style={styles.loadingOverlay}>
          <LoadingState label="Analyzing your scan..." size="large" />
        </View>
      )}
    </ScrollView>
  );
}



function makeStyles(themeObj: any) {
  return StyleSheet.create({
    screen: { flex: 1, backgroundColor: themeObj.colors.background },
    content: { padding: themeObj.spacing.lg, gap: themeObj.spacing.lg },
    title: {
      ...themeObj.typography.h1,
      color: themeObj.colors.text,
      marginBottom: themeObj.spacing.xs,
    },
    subtitle: {
      ...themeObj.typography.body1,
      color: themeObj.colors.textSecondary,
      marginBottom: themeObj.spacing.sm,
    },
    previewContainer: { position: 'relative' },
    preview: {
      height: 280,
      borderRadius: themeObj.radius.lg,
      width: '100%',
      marginBottom: themeObj.spacing.md,
    },
    clearButton: {
      position: 'absolute',
      top: themeObj.spacing.md,
      right: themeObj.spacing.md,
      width: 32,
      height: 32,
      borderRadius: themeObj.radius.full,
      backgroundColor: 'rgba(0,0,0,0.6)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    clearButtonText: { color: themeObj.colors.text, fontSize: 18, fontWeight: '600' },
    imageInfo: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      paddingVertical: themeObj.spacing.sm,
      borderTopWidth: 1,
      borderTopColor: themeObj.colors.divider,
    },
    infoItem: { alignItems: 'center' },
    infoLabel: { ...themeObj.typography.caption, color: themeObj.colors.textSecondary, marginBottom: 2 },
    infoValue: { ...themeObj.typography.subtitle2, color: themeObj.colors.text, fontWeight: '500' },
    placeholder: {
      height: 280,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: themeObj.colors.surfaceVariant,
      borderRadius: themeObj.radius.lg,
      borderWidth: 2,
      borderColor: themeObj.colors.border,
      borderStyle: 'dashed',
    },
    placeholderIcon: { fontSize: 48, marginBottom: themeObj.spacing.md },
    placeholderTitle: { ...themeObj.typography.h5, color: themeObj.colors.text, marginBottom: themeObj.spacing.xs },
    placeholderText: { ...themeObj.typography.body2, color: themeObj.colors.textSecondary, textAlign: 'center', paddingHorizontal: themeObj.spacing.lg },
    selectedCount: { marginTop: 8, color: themeObj.colors.textSecondary, ...themeObj.typography.caption },
    actionRow: { flexDirection: 'row', gap: themeObj.spacing.md, marginTop: themeObj.spacing.lg },
    secondaryButton: { flex: 1, paddingVertical: themeObj.spacing.md, borderRadius: themeObj.radius.md, backgroundColor: themeObj.colors.surfaceVariant, alignItems: 'center', borderWidth: 1, borderColor: themeObj.colors.border },
    secondaryButtonText: { ...themeObj.typography.subtitle1, color: themeObj.colors.text, fontWeight: '500' },
    primaryButton: { marginTop: themeObj.spacing.md, paddingVertical: themeObj.spacing.lg, borderRadius: themeObj.radius.md, backgroundColor: themeObj.colors.primary, alignItems: 'center' },
    disabled: { opacity: 0.5 },
    primaryButtonText: { ...themeObj.typography.subtitle1, color: themeObj.colors.onPrimary, fontWeight: '600' },
    tipsTitle: { ...themeObj.typography.h6, color: themeObj.colors.text, marginBottom: themeObj.spacing.md },
    tipItem: { flexDirection: 'row', alignItems: 'center', gap: themeObj.spacing.md, marginBottom: themeObj.spacing.sm },
    tipIcon: { fontSize: 20 },
    tipText: { ...themeObj.typography.body2, color: themeObj.colors.textSecondary, flex: 1 },
    loadingOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: themeObj.colors.overlay, justifyContent: 'center', alignItems: 'center' },
    thumbRow: { marginTop: themeObj.spacing.sm },
    thumbWrap: { position: 'relative' },
    thumbSmall: { width: 84, height: 84, borderRadius: themeObj.radius.md, marginRight: themeObj.spacing.sm },
    thumbRemove: { position: 'absolute', top: 4, right: 4, backgroundColor: 'rgba(0,0,0,0.5)', width: 22, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
    thumbRemoveText: { color: '#fff', fontSize: 12 },
  });
}
