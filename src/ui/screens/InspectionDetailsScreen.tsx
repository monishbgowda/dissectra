import React, { useEffect, useState } from 'react';
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import {
    analyzeInspection,
} from '../../../backend/services/inspectionApi';
import { deleteInspection, getInspection } from '../../storage/inspectionStorage';
import { Inspection } from '../../storage/inspectionTypes';
import type { RootStackParamList } from '../../types/navigation'; // Adjust path if needed
import {
    uploadInspectionImage,
} from '../../../backend/services/uploadApi';
import type {
  NativeStackNavigationProp,
} from "@react-navigation/native-stack";
type InspectionNavigationProp =
  NativeStackNavigationProp<
    RootStackParamList,
    "InspectionDetails"
  >;
type InspectionRouteProp = RouteProp<RootStackParamList, 'InspectionDetails'>;

const InspectionDetailsScreen = () => {
const navigation =
  useNavigation<InspectionNavigationProp>();
  const route = useRoute<InspectionRouteProp>();
  const { inspectionId } = route.params;

  const [inspection, setInspection] = useState<Inspection | null>(null);
  const [loading, setLoading] = useState(true);
const [analyzing, setAnalyzing] =
    useState(false);
async function loadInspection(): Promise<void> {
  const data = await getInspection(inspectionId);

  setInspection(data);

  setLoading(false);
}

  useEffect(() => {
    loadInspection();
  }, [inspectionId]);

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
        <Text>Loading...</Text>
      </View>
    );
  }

  if (!inspection) {
    return (
      <View style={styles.container}>
        <Text>Inspection not found</Text>
      </View>
    );
  }
async function refreshInspection(): Promise<void> {
  await loadInspection();
}
async function uploadImages(): Promise<void> {
  if (!inspection) {
    return;
  }

  for (const image of inspection.images) {
    console.log(
      "Uploading:",
      image.filePath,
    );

    await uploadInspectionImage(
      inspection.id,
      image.filePath,
    );
  }

  console.log(
    "All images uploaded.",
  );
}
async function analyzeCurrentInspection() {
  if (!inspection) {
    throw new Error(
      "Inspection not found.",
    );
  }

  return analyzeInspection(
    inspection.id,
  );
}
async function handleAnalyze() {
  try {
    setAnalyzing(true);

    await uploadImages();

    const result =
      await analyzeCurrentInspection();

    console.log(result);

    Alert.alert(
      "Success",
      "Analysis completed.",
    );

    await refreshInspection();

  } catch (error: any) {

    console.log(error);
    console.log(error.response?.data);

    Alert.alert(
      "Error",
      error.message,
    );

  } finally {

    setAnalyzing(false);

  }
}
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>{inspection.objectName}</Text>
      <Text style={styles.subtitle}>Inspection Details</Text>

      <Image source={{ uri: inspection.thumbnail }} style={styles.thumbnail} />

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
        <View key={image.id} style={styles.imageCard}>
          <Text style={styles.imageTitle}>{image.angle ?? image.fileName}</Text>
          <Image source={{ uri: image.filePath }} style={styles.snapshot} />
        </View>
      ))}
<TouchableOpacity
    style={styles.analyzeButton}
    onPress={handleAnalyze}
    disabled={analyzing}>

    <Text
        style={styles.analyzeText}>

        {
            analyzing
                ? 'Analyzing...'
                : 'Analyze Inspection'
        }

    </Text>

</TouchableOpacity>
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
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  thumbnail: {
    width: '100%',
    height: 240,
    borderRadius: 16,
    marginTop: 20,
    resizeMode: 'cover',
  },
  section: {
    width: '100%',
    marginTop: 16,
  },
  heading: {
    fontSize: 16,
    fontWeight: '700',
  },
  value: {
    fontSize: 16,
    marginTop: 4,
  },
  galleryTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginTop: 30,
    marginBottom: 12,
  },
  imageCard: {
    marginBottom: 24,
  },
  imageTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  snapshot: {
    width: '100%',
    height: 220,
    borderRadius: 14,
    marginBottom: 15,
    resizeMode: 'cover',
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

export default InspectionDetailsScreen;
