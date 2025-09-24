import React from 'react';
import { View, StyleSheet } from 'react-native';

/**
 * Native overlay using React Native View components instead of SVG
 * This should work better with camera views
 */
const NativeOverlay = ({ 
  landmarks, 
  width, 
  height, 
  showSkeleton = true,
  jointRadius = 6,
  modelType = 'movenet'
}) => {
  console.log('NativeOverlay render:', {
    showSkeleton,
    landmarksCount: landmarks?.length || 0,
    width,
    height
  });

  if (!showSkeleton || !landmarks || landmarks.length === 0) {
    console.log('NativeOverlay: Not rendering - no landmarks or skeleton hidden');
    return null;
  }

  // Filter landmarks by confidence
  const validLandmarks = landmarks.filter(
    landmark => landmark && landmark.visibility >= 0.5
  );

  console.log('Valid landmarks for native overlay:', validLandmarks.length);

  if (validLandmarks.length === 0) {
    console.log('No valid landmarks after filtering');
    return null;
  }

  return (
    <View style={[styles.overlay, { width, height }]} pointerEvents="none">
      {/* Render landmarks as circular views */}
      {validLandmarks.map((landmark, index) => {
        if (!landmark || landmark.x < 0 || landmark.y < 0 || 
            landmark.x > width || landmark.y > height) {
          return null;
        }

        return (
          <View
            key={`landmark-${index}`}
            style={[
              styles.landmark,
              {
                left: landmark.x - jointRadius,
                top: landmark.y - jointRadius,
                width: jointRadius * 2,
                height: jointRadius * 2,
                borderRadius: jointRadius,
                backgroundColor: getLandmarkColor(index),
                opacity: landmark.visibility,
              }
            ]}
          />
        );
      })}
      
      {/* Debug marker in center */}
      <View style={[styles.debugMarker, {
        left: width / 2 - 15,
        top: height / 2 - 15,
      }]} />
      
      {/* Corner markers for debugging */}
      <View style={[styles.cornerMarker, { left: 20, top: 20 }]} />
      <View style={[styles.cornerMarker, { right: 20, top: 20 }]} />
      <View style={[styles.cornerMarker, { left: 20, bottom: 20 }]} />
      <View style={[styles.cornerMarker, { right: 20, bottom: 20 }]} />
    </View>
  );
};

// Get color for landmark based on index
const getLandmarkColor = (index) => {
  const colors = [
    '#FF6B6B', // Red for face
    '#4ECDC4', // Teal for torso
    '#45B7D1', // Blue for left arm
    '#96CEB4', // Green for right arm
    '#FFEAA7', // Yellow for left leg
    '#DDA0DD', // Purple for right leg
  ];
  
  if (index <= 4) return colors[0]; // Face
  if (index <= 6) return colors[1]; // Shoulders
  if (index <= 10 && index % 2 === 1) return colors[2]; // Left arm
  if (index <= 10 && index % 2 === 0) return colors[3]; // Right arm
  if (index <= 16 && index % 2 === 1) return colors[4]; // Left leg
  return colors[5]; // Right leg
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 999, // Very high z-index
    backgroundColor: 'rgba(255, 0, 0, 0.1)', // Red tint for debugging
  },
  landmark: {
    position: 'absolute',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 5, // Android shadow
  },
  debugMarker: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#FF0000',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    zIndex: 1000,
  },
  cornerMarker: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#00FF00',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    zIndex: 1000,
  },
});

export default NativeOverlay;
