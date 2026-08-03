import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { useTheme } from '../../theme/ThemeProvider';
import {
    analyzeInspection,
} from '../../../backend/services/inspectionApi';
import { deleteInspection, getInspection, saveInspection } from '../../storage/inspectionStorage';
import { Inspection, InspectionImage } from '../../storage/inspectionTypes';
import type { RootStackParamList } from '../../types/navigation'; // Adjust path if needed
import {
    uploadInspectionImage,
} from '../../../backend/services/uploadApi';
import type {
  NativeStackNavigationProp,
} from "@react-navigation/native-stack";
import Icon from "react-native-vector-icons/Ionicons";
import { api } from "../../services/apiClient";
type InspectionNavigationProp =
  NativeStackNavigationProp<
    RootStackParamList,
    "InspectionDetails"
  >;
type InspectionRouteProp = RouteProp<RootStackParamList, 'InspectionDetails'>;

const InspectionDetailsScreen = () => {
const { theme } = useTheme();
const navigation =
  useNavigation<InspectionNavigationProp>();
  const route = useRoute<InspectionRouteProp>();
  const { inspectionId } = route.params;

  const [inspection, setInspection] = useState<Inspection | null>(null);
  const [loading, setLoading] = useState(true);
const [analyzing, setAnalyzing] =
    useState(false);
  const [viewerImage, setViewerImage] = useState<InspectionImage | null>(null);

  const styles = StyleSheet.create({
    container: {
      marginTop: 25,
      padding: 20,
      paddingBottom: 80,
      backgroundColor: theme.colors.background,
      flexGrow: 1,
      marginBottom: 20,
    },
    backButton: {
      flexDirection: 'row',
      alignItems: 'center',
      alignSelf: 'flex-start',
      paddingVertical: 8,
      paddingRight: 16,
      marginBottom: 8,
    },
    backText: {
      color: theme.colors.text,
      fontSize: 16,
      fontWeight: '600',
      marginLeft: 6,
    },
    title: {
      fontSize: 22,
      fontWeight: 'bold',
      color: theme.colors.text,
    },
    subtitle: {
      fontSize: 16,
      color: theme.colors.textSecondary,
      marginBottom: 20,
    },
    thumbnail: {
      width: '100%',
      height: 240,
      borderRadius: 16,
      marginTop: 20,
      resizeMode: 'cover',
      backgroundColor: theme.colors.surfaceVariant,
    },
    section: {
      width: '100%',
      marginTop: 16,
    },
    heading: {
      fontSize: 16,
      fontWeight: '700',
      color: theme.colors.textSecondary,
    },
    value: {
      fontSize: 16,
      marginTop: 4,
      color: theme.colors.text,
    },
    galleryTitle: {
      fontSize: 20,
      fontWeight: '700',
      marginTop: 30,
      marginBottom: 12,
      color: theme.colors.text,
    },
    imageCard: {
      marginBottom: 24,
    },
    imageTitle: {
      fontSize: 16,
      fontWeight: '600',
      marginBottom: 8,
      color: theme.colors.text,
    },
    snapshot: {
      width: '100%',
      height: 220,
      borderRadius: 14,
      marginBottom: 15,
      resizeMode: 'cover',
      backgroundColor: theme.colors.surfaceVariant,
    },
    viewerOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.85)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 24,
    },
    viewerTitle: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '600',
      marginBottom: 16,
      textAlign: 'center',
    },
    viewerImage: {
      width: '100%',
      height: '70%',
      borderRadius: 12,
      resizeMode: 'contain',
      backgroundColor: theme.colors.surfaceVariant,
    },
    viewerClose: {
      marginTop: 24,
      backgroundColor: theme.colors.primary,
      paddingHorizontal: 28,
      paddingVertical: 12,
      borderRadius: 12,
      alignItems: 'center',
    },
    viewerCloseText: {
      color: theme.colors.onPrimary,
      fontWeight: '700',
      fontSize: 16,
    },
    analyzeButton: {

      marginTop: 40,

      backgroundColor: '#1976D2',

      padding: 16,

      borderRadius: 12,

      alignItems: 'center',

  },

  analyzeText: {

      color: '#FFFFFF',

      fontWeight: '700',

      fontSize: 18,

  },
    deleteButton: {
      marginTop: 40,
      backgroundColor: '#D32F2F',
      padding: 16,
      width: '100%',
      borderRadius: 12,
      alignItems: 'center',
    },
    deleteText: {
      color: '#FFFFFF',
      fontWeight: '700',
      fontSize: 18,
    },
  });

const loadInspection = useCallback(async (): Promise<void> => {
  const data = await getInspection(inspectionId);

  setInspection(data);

  setLoading(false);
}, [inspectionId]);

  useEffect(() => {
    loadInspection();
  }, [loadInspection]);

  const handleDelete = () => {
    Alert.alert(
      'Delete Inspection',
      'Are you sure you want to delete this inspection?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            if (!inspection) return;
            await deleteInspection(inspection.id);
            navigation.goBack();
          },
        },
      ],
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.value}>Loading...</Text>
      </View>
    );
  }

  if (!inspection) {
    return (
      <View style={styles.container}>
        <Text style={styles.value}>Inspection not found</Text>
      </View>
    );
  }
async function refreshInspection(): Promise<void> {
  await loadInspection();
}
async function uploadImages(): Promise<void> {

    if (!inspection || inspection.images.length === 0) {
        return;
    }

    const start = Date.now();

    await Promise.all(

        inspection.images.map(async (image, index) => {

            const imageStart = Date.now();

            await uploadInspectionImage(
                inspection.id,
                image.filePath,
            );

            console.log(
                `Image ${index + 1} uploaded in ${
                    Date.now() - imageStart
                } ms`
            );

        })

    );

    console.log(
        `All uploads completed in ${
            Date.now() - start
        } ms`
    );

}

async function analyzeCurrentInspection(id: string) {
  console.log("BASE URL:", api.defaults.baseURL);
  const result = await analyzeInspection(id);
  return result?.analysis ?? result;
}

async function handleAnalyze() {

    if (!inspection) {
        return;
    }

    const id = inspection.id;

    try {

        setAnalyzing(true);

        inspection.status = "PROCESSING";
        inspection.updatedAt = new Date().toISOString();
        await saveInspection(inspection);
        setInspection({ ...inspection });

        const uploadStart = Date.now();
        await uploadImages();
        console.log(
            `UPLOAD TIME : ${Date.now() - uploadStart} ms`
        );

        console.log("Starting backend analysis...");
        const result = await analyzeCurrentInspection(id);

        const updatedInspection = {
    ...inspection,
    status: "COMPLETED" as const,
    updatedAt: new Date().toISOString(),

    // Save analysis locally
    analysis: result,

    // Optional: update object information
    objectName:
        result?.product?.name ??
        inspection.objectName,

    confidence:
        result?.product?.confidence ??
        inspection.confidence,
};

        setInspection(updatedInspection);
        await saveInspection(updatedInspection);
console.log("===== SAVED INSPECTION =====");
console.log(JSON.stringify(updatedInspection, null, 2));
        await refreshInspection();
const reloaded = await getInspection(id);

console.log("===== RELOADED INSPECTION =====");
console.log(JSON.stringify(reloaded, null, 2));
        navigation.navigate("Analysis", {
            inspectionId: id,
            analysis: result,
        });

    } catch (error: any) {

        const failedInspection = {
            ...inspection,
            status: "FAILED" as const,
            updatedAt: new Date().toISOString(),
        };

        setInspection(failedInspection);
        await saveInspection(failedInspection);

        console.log(error);

        Alert.alert(
            "Analysis Failed",
            error?.response?.data?.error ??
            error?.message ??
            "Unknown error",
        );

    } finally {

        setAnalyzing(false);

    }

}
  return (
    <>
    <ScrollView contentContainerStyle={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()} activeOpacity={0.7}>
        <Icon name="arrow-back" size={24} color={theme.colors.text} />
        <Text style={styles.backText}>Back</Text>
      </TouchableOpacity>
      <Text style={styles.title}>{inspection.objectName}</Text>
      <Text style={styles.subtitle}>Inspection Details</Text>

      <Pressable onPress={() => setViewerImage({
        id: 'thumbnail',
        fileName: 'Thumbnail',
        filePath: inspection.thumbnail,
        capturedAt: inspection.createdAt,
      })}>
        <Image source={{ uri: inspection.thumbnail }} style={styles.thumbnail} />
      </Pressable>

      <View style={styles.section}>
        <Text style={styles.heading}>Object</Text>
        <Text style={styles.value}>{inspection.objectName}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.heading}>Status</Text>
        <Text style={styles.value}>{inspection.status}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.heading}>Images</Text>
        <Text style={styles.value}>{inspection.imageCount}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.heading}>Confidence</Text>
        <Text style={styles.value}>
          {inspection.confidence ? `${Math.round(inspection.confidence * 100)}%` : '--'}
        </Text>
      </View>

      <Text style={styles.galleryTitle}>Captured Images</Text>
      {inspection.images.map((image) => (
        <TouchableOpacity key={image.id} style={styles.imageCard} onPress={() => setViewerImage(image)} activeOpacity={0.8}>
          <Text style={styles.imageTitle}>{image.angle ?? image.fileName}</Text>
          <Image source={{ uri: image.filePath }} style={styles.snapshot} />
        </TouchableOpacity>
      ))}
{inspection.analysis ? (

    <TouchableOpacity
        style={styles.analyzeButton}
        onPress={() =>
            navigation.navigate("Analysis", {
                inspectionId: inspection.id,
                analysis: inspection.analysis,
            })
        }>

        <Text style={styles.analyzeText}>
            View Analysis
        </Text>

    </TouchableOpacity>

) : (

    <TouchableOpacity
        style={styles.analyzeButton}
        onPress={handleAnalyze}
        disabled={analyzing}>

        <Text style={styles.analyzeText}>

            {analyzing
                ? "Analyzing..."
                : "Start Analysis"}

        </Text>

    </TouchableOpacity>

)}
      <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
        <Text style={styles.deleteText}>Delete Inspection</Text>
      </TouchableOpacity>

      <View style={styles.section}>
        <Text style={styles.heading}>Created</Text>
        <Text style={styles.value}>
          {new Date(inspection.createdAt).toLocaleString()}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.heading}>Last Updated</Text>
        <Text style={styles.value}>
          {new Date(inspection.updatedAt).toLocaleString()}
        </Text>
      </View>
    </ScrollView>

      <Modal
        visible={viewerImage !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setViewerImage(null)}>
        <View style={styles.viewerOverlay}>
          {viewerImage && (
            <>
              <Text style={styles.viewerTitle}>{viewerImage.angle ?? viewerImage.fileName}</Text>
              <Image
                source={{ uri: viewerImage.filePath }}
                style={styles.viewerImage}
                resizeMode="contain"
              />
              <TouchableOpacity style={styles.viewerClose} onPress={() => setViewerImage(null)}>
                <Text style={styles.viewerCloseText}>Close</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </Modal>
    </>
  );
};

export default InspectionDetailsScreen;
