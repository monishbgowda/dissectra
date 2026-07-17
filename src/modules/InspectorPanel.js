import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function InspectorPanel({ component }) {

  if (!component) return null;

  return (
    <View style={styles.panel}>
      <Text style={styles.title}>{component.name}</Text>

      <Text>Function: {component.function}</Text>
      <Text>Material: {component.material}</Text>
      <Text>Category: {component.category}</Text>

    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    backgroundColor: '#fff',
    padding: 15,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    elevation: 10
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5
  }
});