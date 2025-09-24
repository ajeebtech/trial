import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import SuperSimpleOverlay from './components/SuperSimpleOverlay';
import NativeOverlay from './components/NativeOverlay';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

/**
 * Simple test app that just shows pose overlays without any camera complications
 */
export default function TestPoseApp() {
  const [showOverlay, setShowOverlay] = useState(false);
  const [landmarks, setLandmarks] = useState([]);

  // Create test landmarks immediately
  useEffect(() => {
    const testLandmarks = [
      { x: screenWidth * 0.5, y: screenHeight * 0.2, visibility: 0.9 }, // nose
      { x: screenWidth * 0.45, y: screenHeight * 0.18, visibility: 0.9 }, // left eye
      { x: screenWidth * 0.55, y: screenHeight * 0.18, visibility: 0.9 }, // right eye
      { x: screenWidth * 0.42, y: screenHeight * 0.16, visibility: 0.9 }, // left ear
      { x: screenWidth * 0.58, y: screenHeight * 0.16, visibility: 0.9 }, // right ear
      { x: screenWidth * 0.35, y: screenHeight * 0.35, visibility: 0.9 }, // left shoulder
      { x: screenWidth * 0.65, y: screenHeight * 0.35, visibility: 0.9 }, // right shoulder
      { x: screenWidth * 0.25, y: screenHeight * 0.5, visibility: 0.9 }, // left elbow
      { x: screenWidth * 0.75, y: screenHeight * 0.5, visibility: 0.9 }, // right elbow
      { x: screenWidth * 0.2, y: screenHeight * 0.65, visibility: 0.9 }, // left wrist
      { x: screenWidth * 0.8, y: screenHeight * 0.65, visibility: 0.9 }, // right wrist
      { x: screenWidth * 0.4, y: screenHeight * 0.7, visibility: 0.9 }, // left hip
      { x: screenWidth * 0.6, y: screenHeight * 0.7, visibility: 0.9 }, // right hip
      { x: screenWidth * 0.38, y: screenHeight * 0.85, visibility: 0.9 }, // left knee
      { x: screenWidth * 0.62, y: screenHeight * 0.85, visibility: 0.9 }, // right knee
      { x: screenWidth * 0.36, y: screenHeight * 0.95, visibility: 0.9 }, // left ankle
      { x: screenWidth * 0.64, y: screenHeight * 0.95, visibility: 0.9 }, // right ankle
    ];
    
    console.log('TestPoseApp: Setting test landmarks');
    setLandmarks(testLandmarks);
    setShowOverlay(true);
  }, []);

  return (
    <View style={styles.container}>
      {/* Background */}
      <View style={styles.background}>
        <Text style={styles.backgroundText}>FAKE CAMERA VIEW</Text>
        <Text style={styles.instructionText}>This simulates what you should see on the real camera</Text>
      </View>

      {/* Always show simple overlay */}
      <SuperSimpleOverlay
        width={screenWidth}
        height={screenHeight}
      />

      {/* Show pose overlay if enabled */}
      {showOverlay && (
        <NativeOverlay
          landmarks={landmarks}
          width={screenWidth}
          height={screenHeight}
          showSkeleton={true}
          jointRadius={8}
          modelType="movenet"
        />
      )}

      {/* Controls */}
      <View style={styles.controls}>
        <TouchableOpacity
          style={[styles.button, styles.toggleButton]}
          onPress={() => setShowOverlay(!showOverlay)}
        >
          <Text style={styles.buttonText}>
            {showOverlay ? 'Hide Pose' : 'Show Pose'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.testButton]}
          onPress={() => {
            console.log('Test button pressed');
            console.log('Landmarks count:', landmarks.length);
            console.log('Show overlay:', showOverlay);
          }}
        >
          <Text style={styles.buttonText}>Test Log</Text>
        </TouchableOpacity>
      </View>

      {/* Info */}
      <View style={styles.info}>
        <Text style={styles.infoText}>Landmarks: {landmarks.length}</Text>
        <Text style={styles.infoText}>Overlay: {showOverlay ? 'ON' : 'OFF'}</Text>
        <Text style={styles.infoText}>Screen: {screenWidth}x{screenHeight}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  background: {
    flex: 1,
    backgroundColor: '#333333',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backgroundText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  instructionText: {
    color: '#CCCCCC',
    fontSize: 16,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  controls: {
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
  },
  button: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  toggleButton: {
    backgroundColor: '#FF6B35',
  },
  testButton: {
    backgroundColor: '#007AFF',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  info: {
    position: 'absolute',
    top: 50,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 10,
    borderRadius: 8,
  },
  infoText: {
    color: '#FFFFFF',
    fontSize: 12,
    marginBottom: 2,
  },
});
