import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../../theme/ThemeProvider';
import type { DeviceClassificationResult } from '../../types/dissectra';

interface DeviceClassificationCardProps {
  deviceClassification?: DeviceClassificationResult | null;
}

const CLASS_DISPLAY_NAMES: Record<string, string> = {
  mouse: 'Computer Mouse',
  pendrive: 'USB Flash Drive',
  other: 'Other',
  A: 'Computer Mouse',
  B: 'USB Flash Drive',
  C: 'Other',
};

export const DeviceClassificationCard: React.FC<DeviceClassificationCardProps> = ({
  deviceClassification,
}) => {
  const { theme } = useTheme();

  if (!deviceClassification) {
    return null;
  }

  const {
    predictedClass,
    predictedToken,
    confidenceAvailable,
    calibrated,
    calibratedConfidence,
    uncertaintyLabel,
    probabilities,
  } = deviceClassification;

  // Resolve display device name
  let deviceName = 'Unknown Device';
  if (predictedClass && CLASS_DISPLAY_NAMES[predictedClass]) {
    deviceName = CLASS_DISPLAY_NAMES[predictedClass];
  } else if (predictedToken && CLASS_DISPLAY_NAMES[predictedToken]) {
    deviceName = CLASS_DISPLAY_NAMES[predictedToken];
  } else if (deviceClassification.classes && predictedToken && deviceClassification.classes[predictedToken]) {
    deviceName = deviceClassification.classes[predictedToken];
  }

  // Determine Uncertainty badge color
  let uncertaintyColor = theme.colors.textSecondary;
  if (uncertaintyLabel === 'Low') {
    uncertaintyColor = theme.colors.confidenceHigh;
  } else if (uncertaintyLabel === 'Medium') {
    uncertaintyColor = theme.colors.confidenceMedium;
  } else if (uncertaintyLabel === 'High') {
    uncertaintyColor = theme.colors.confidenceLow;
  }

  // Display cases
  const isFullyCalibrated =
    confidenceAvailable === true &&
    calibrated === true &&
    typeof calibratedConfidence === 'number' &&
    !isNaN(calibratedConfidence);

  const isUncalibratedAvailable =
    confidenceAvailable === true && calibrated === false;

  const styles = StyleSheet.create({
    card: {
      backgroundColor: theme.colors.card,
      borderRadius: theme.radius.lg,
      borderWidth: 1,
      borderColor: theme.colors.border,
      padding: theme.spacing.lg,
      marginBottom: theme.spacing.xl,
      ...theme.shadows.md,
    },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: theme.spacing.md,
    },
    heading: {
      ...theme.typography.h2,
      color: theme.colors.text,
    },
    modelBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      backgroundColor: theme.colors.surfaceVariant,
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: theme.radius.pill,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    modelBadgeText: {
      ...theme.typography.caption,
      color: theme.colors.textSecondary,
      fontWeight: '600',
    },
    infoRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 8,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.divider,
    },
    label: {
      ...theme.typography.body1,
      color: theme.colors.textSecondary,
      fontWeight: '600',
      flex: 1,
    },
    value: {
      ...theme.typography.body1,
      color: theme.colors.text,
      flex: 1,
      textAlign: 'right',
      fontWeight: '600',
    },
    uncertaintyValue: {
      ...theme.typography.body1,
      fontWeight: '700',
      flex: 1,
      textAlign: 'right',
    },
    subtext: {
      ...theme.typography.caption,
      color: theme.colors.textSecondary,
      marginTop: 8,
      fontStyle: 'italic',
    },
    breakdownContainer: {
      marginTop: theme.spacing.md,
      paddingTop: theme.spacing.sm,
      borderTopWidth: 1,
      borderTopColor: theme.colors.divider,
    },
    breakdownTitle: {
      ...theme.typography.caption,
      color: theme.colors.textSecondary,
      fontWeight: '700',
      marginBottom: 6,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    breakdownRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 4,
    },
    breakdownLabel: {
      ...theme.typography.body2,
      color: theme.colors.textSecondary,
    },
    breakdownValue: {
      ...theme.typography.body2,
      color: theme.colors.text,
      fontWeight: '600',
    },
  });

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={styles.heading}>Device Identification</Text>
        <View style={styles.modelBadge}>
          <Icon name="hardware-chip-outline" size={14} color={theme.colors.textSecondary} />
          <Text style={styles.modelBadgeText}>Local model</Text>
        </View>
      </View>

      {/* Device Type */}
      <View style={styles.infoRow}>
        <Text style={styles.label}>Device Type</Text>
        <Text style={styles.value}>{deviceName}</Text>
      </View>

      {/* Confidence */}
      <View style={styles.infoRow}>
        <Text style={styles.label}>Confidence</Text>
        <Text style={styles.value}>
          {isFullyCalibrated
            ? `${(calibratedConfidence * 100).toFixed(1)}%`
            : isUncalibratedAvailable
            ? 'Calibrated confidence unavailable'
            : 'Device confidence unavailable'}
        </Text>
      </View>

      {/* Uncertainty */}
      {uncertaintyLabel ? (
        <View style={styles.infoRow}>
          <Text style={styles.label}>Uncertainty</Text>
          <Text style={[styles.uncertaintyValue, { color: uncertaintyColor }]}>
            {uncertaintyLabel}
          </Text>
        </View>
      ) : null}

      {/* Optional Subtext */}
      {isFullyCalibrated ? (
        <Text style={styles.subtext}>Calibrated local model confidence</Text>
      ) : null}

      {/* Class Probabilities Breakdown (if calibrated) */}
      {isFullyCalibrated && probabilities ? (
        <View style={styles.breakdownContainer}>
          <Text style={styles.breakdownTitle}>Class Distribution</Text>
          <View style={styles.breakdownRow}>
            <Text style={styles.breakdownLabel}>Computer Mouse</Text>
            <Text style={styles.breakdownValue}>
              {((probabilities.mouse ?? 0) * 100).toFixed(1)}%
            </Text>
          </View>
          <View style={styles.breakdownRow}>
            <Text style={styles.breakdownLabel}>USB Flash Drive</Text>
            <Text style={styles.breakdownValue}>
              {((probabilities.pendrive ?? 0) * 100).toFixed(1)}%
            </Text>
          </View>
          <View style={styles.breakdownRow}>
            <Text style={styles.breakdownLabel}>Other</Text>
            <Text style={styles.breakdownValue}>
              {((probabilities.other ?? 0) * 100).toFixed(1)}%
            </Text>
          </View>
        </View>
      ) : null}
    </View>
  );
};

export default DeviceClassificationCard;
