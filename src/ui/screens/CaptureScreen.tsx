import React, { useState } from 'react';
import { Alert, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { launchCamera, launchImageLibrary, ImageLibraryOptions, CameraOptions } from 'react-native-image-picker';
import { GlassCard } from '../components/GlassCard';
import { LoadingState } from '../components/LoadingState';
import { runScanPipeline } from '../../services/scanPipeline';
import { MAX_IMAGE_BYTES } from '../../config/env';
import { theme } from '../../theme/theme';

interface ImageAssetInfo {
  uri: string;
  fileName?: string;
  fileSize?: number;
  type?: string;
}

export function CaptureScreen({ navigation }: any) {
  const [asset, setAsset] = useState<ImageAssetInfo | null>(null);
  const [loading, setLoading] = useState(false);

  const options: ImageLibraryOptions & CameraOptions = {
    mediaType: 'photo',
    quality: 0.8,
    maxWidth: 1920,
    maxHeight: 1920,
    saveToPhotos: false,
  };

  async function pick(kind: 'camera' | 'gallery') {
    try {
      const result = kind === 'camera' ? await launchCamera(options) : await launchImageLibrary(options);
      const assetItem = result.assets?.[0];
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

  async function process() {
    if (!asset?.uri) return;
    setLoading(true);
    try {
      const scan = await runScanPipeline(asset.uri);
      navigation.navigate('Home', { scan });
    } catch (error: any) {
      Alert.alert('Processing failed', error.message || 'Scan cached locally, try again later.');
    } finally {
      setLoading(false);
    }
  }

  function clearSelection() {
    setAsset(null);
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
          </View>
        ) : (
          <View style={styles.placeholder}>
            <Text style={styles.placeholderIcon}>📷</Text>
            <Text style={styles.placeholderTitle}>No Image Selected</Text>
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
            onPress={() => pick('gallery')}
            disabled={loading}
          >
            <Text style={styles.secondaryButtonText}>🖼️ Gallery</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          disabled={!asset?.uri || loading} 
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

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: theme.colors.background },
  content: { padding: theme.spacing.lg, gap: theme.spacing.lg },
  title: {
    ...theme.typography.h1,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    ...theme.typography.body1,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
  },
  previewContainer: {
    position: 'relative',
  },
  preview: {
    height: 280,
    borderRadius: theme.radius.lg,
    width: '100%',
    marginBottom: theme.spacing.md,
  },
  clearButton: {
    position: 'absolute',
    top: theme.spacing.md,
    right: theme.spacing.md,
    width: 32,
    height: 32,
    borderRadius: theme.radius.full,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  clearButtonText: {
    color: theme.colors.text,
    fontSize: 18,
    fontWeight: '600',
  },
  imageInfo: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.divider,
  },
  infoItem: {
    alignItems: 'center',
  },
  infoLabel: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    marginBottom: 2,
  },
  infoValue: {
    ...theme.typography.subtitle2,
    color: theme.colors.text,
    fontWeight: '500',
  },
  placeholder: {
    height: 280,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surfaceVariant,
    borderRadius: theme.radius.lg,
    borderWidth: 2,
    borderColor: theme.colors.border,
    borderStyle: 'dashed',
  },
  placeholderIcon: {
    fontSize: 48,
    marginBottom: theme.spacing.md,
  },
  placeholderTitle: {
    ...theme.typography.h5,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  placeholderText: {
    ...theme.typography.body2,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: theme.spacing.lg,
  },
  actionRow: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginTop: theme.spacing.lg,
  },
  secondaryButton: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.surfaceVariant,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  secondaryButtonText: {
    ...theme.typography.subtitle1,
    color: theme.colors.text,
    fontWeight: '500',
  },
  primaryButton: {
    marginTop: theme.spacing.md,
    paddingVertical: theme.spacing.lg,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    ...theme.shadows.md,
  },
  disabled: {
    opacity: 0.5,
  },
  primaryButtonText: {
    ...theme.typography.subtitle1,
    color: theme.colors.onPrimary,
    fontWeight: '600',
  },
  tipsTitle: {
    ...theme.typography.h6,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  tipIcon: {
    fontSize: 20,
  },
  tipText: {
    ...theme.typography.body2,
    color: theme.colors.textSecondary,
    flex: 1,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: theme.colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
