import React, { useState, useEffect, useRef, useCallback } from "react";
import { View, Text, StyleSheet, Animated, Easing, TouchableOpacity } from "react-native";
import InspectorPanel from "./InspectorPanel";

const MODEL_COLORS = {
  duck: '#FFD700',      // Gold
  box: '#4A90D9',       // Blue
  avocado: '#5B8C5A',   // Green
};

export default function ModelViewer({ modelUrl, modelName, components }) {
  const [selectedComponent, setSelectedComponent] = useState(components?.[0] || null);
  const [paused, setPaused] = useState(false);
  const rotation = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(1)).current;
  const animationRef = useRef(null);

  const modelId = modelUrl?.includes('Duck') ? 'duck' : 
                  modelUrl?.includes('Box') ? 'box' : 
                  modelUrl?.includes('Avocado') ? 'avocado' : 'duck';
  const modelColor = MODEL_COLORS[modelId] || MODEL_COLORS.duck;

  const startAnimation = useCallback(() => {
    animationRef.current = Animated.loop(
      Animated.timing(rotation, {
        toValue: 1,
        duration: 4000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    animationRef.current.start();
  }, [rotation]);

  useEffect(() => {
    startAnimation();
    // Pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(scale, { toValue: 1.1, duration: 1000, useNativeDriver: true }),
        Animated.timing(scale, { toValue: 1, duration: 1000, useNativeDriver: true }),
      ])
    ).start();
  }, [startAnimation, scale]);

  useEffect(() => {
    if (!selectedComponent && components?.length) {
      setSelectedComponent(components[0]);
    }
  }, [components, selectedComponent]);

  const togglePause = () => {
    if (paused) {
      setPaused(false);
      startAnimation();
    } else {
      setPaused(true);
      animationRef.current?.stop();
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.animationStage}>
        <TouchableOpacity style={styles.touchArea} onPress={togglePause} activeOpacity={0.8}>
          <Animated.View
            style={[
              styles.modelPlaceholder,
              {
                backgroundColor: modelColor,
                transform: [
                  { rotateY: rotation.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "360deg"] }) },
                  { rotateX: rotation.interpolate({ inputRange: [0, 1], outputRange: ["15deg", "15deg"] }) },
                  { scale: scale },
                ],
              },
            ]}
          >
            <Text style={styles.modelIcon}>
              {modelId === 'duck' ? '🦆' : modelId === 'box' ? '📦' : '🥑'}
            </Text>
          </Animated.View>
        </TouchableOpacity>
        
        <Text style={styles.title}>{modelName || '3D Model'}</Text>
        <Text style={styles.subtitle}>
          {paused ? '▶ Tap to resume' : '⏸ Tap to pause'}
        </Text>
        
        <View style={styles.urlBadge}>
          <Text style={styles.urlText} numberOfLines={1}>
            🌐 {modelUrl?.split('/').pop() || 'model.glb'}
          </Text>
        </View>
      </View>

      <InspectorPanel component={selectedComponent} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  animationStage: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modelPlaceholder: {
    width: 160,
    height: 160,
    borderRadius: 80,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.5,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 10,
  },
  modelIcon: {
    fontSize: 60,
  },
  touchArea: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    marginTop: 24,
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  subtitle: {
    marginTop: 8,
    color: '#888',
    fontSize: 14,
  },
  urlBadge: {
    marginTop: 16,
    backgroundColor: '#1a1a1a',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#333',
  },
  urlText: {
    color: '#5ddcff',
    fontSize: 12,
    fontFamily: 'monospace',
  },
});