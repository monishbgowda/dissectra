import React, { useState } from 'react';
import { View, Button, Text, StyleSheet, Alert, Image, PermissionsAndroid, Platform, ActivityIndicator } from 'react-native';
import { launchCamera } from 'react-native-image-picker';

export default function CameraCapture({ onCapture }) {
  const [preview, setPreview] = useState(null);
  const [capturing, setCapturing] = useState(false);

  const requestCameraPermission = async () => {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.CAMERA,
        {
          title: 'Camera Permission',
          message: 'App needs camera access to take photos',
          buttonPositive: 'OK',
        }
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    }
    return true;
  };

  const requestStoragePermission = async () => {
    if (Platform.OS === 'android') {
      const permission = Platform.Version >= 33
        ? PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES
        : PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE;

      const granted = await PermissionsAndroid.request(permission, {
        title: 'Storage Permission',
        message: 'App needs access to images to read camera photos for processing',
        buttonPositive: 'OK',
      });
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    }
    return true;
  };

  const takePhoto = async () => {
    try {
      setCapturing(true);
      const hasCameraPermission = await requestCameraPermission();
      if (!hasCameraPermission) {
        Alert.alert('Error', 'Camera permission denied');
        return;
      }

      const hasStoragePermission = await requestStoragePermission();
      if (!hasStoragePermission) {
        Alert.alert('Error', 'Storage permission denied');
        return;
      }

      const result = await launchCamera({
        mediaType: 'photo',
        quality: 0.8,
        saveToPhotos: false,
      });

      console.log('Camera result:', result);

      if (result.didCancel) {
        Alert.alert('Cancelled', 'No photo taken');
        return;
      }

      if (result.errorCode) {
        Alert.alert('Error', result.errorMessage || 'Camera error');
        return;
      }

      if (result.assets && result.assets.length > 0) {
        const photo = result.assets[0];
        console.log('Photo captured:', photo);
        console.log('Photo URI:', photo.uri);

        setPreview(photo.uri);
        await onCapture(photo.uri);
      } else {
        Alert.alert('Error', 'No photo data received');
      }
    } catch (error) {
      console.error('Photo capture failed:', error);
      Alert.alert('Capture Failed', error.message || String(error));
    } finally {
      setCapturing(false);
    }
  };

  return (
    <View style={styles.container}>
      {preview ? (
        <Image source={{ uri: preview }} style={styles.preview} />
      ) : (
        <View style={styles.cameraPlaceholder}>
          <Text style={styles.placeholderText}>Tap button to take photo</Text>
        </View>
      )}
      <View style={styles.buttonContainer}>
        {capturing ? (
          <View style={styles.capturingContainer}>
            <ActivityIndicator color="#fff" />
            <Text style={styles.capturingText}>Opening camera...</Text>
          </View>
        ) : (
          <Button title={preview ? 'Retake Photo' : 'Capture Photo'} onPress={takePhoto} />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  cameraPlaceholder: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: '#fff',
    fontSize: 20,
  },
  preview: {
    flex: 1,
    resizeMode: 'contain',
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
  },
  capturingContainer: {
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
  },
  capturingText: {
    marginTop: 8,
    color: '#fff',
    fontSize: 14,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    marginTop: 10,
    fontSize: 16,
  },
});
