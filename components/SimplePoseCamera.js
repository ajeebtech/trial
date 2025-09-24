import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import SuperSimpleOverlay from './SuperSimpleOverlay';
import NativeOverlay from './NativeOverlay';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

/**
 * Simplified Pose Detection Camera without TensorFlow dependencies
 * Shows overlays and mock pose detection
 */
const SimplePoseCamera = ({ onClose }) => {
  // Camera state
  const [permission, requestPermission] = useCameraPermissions();
  const [cameraType, setCameraType] = useState('back');
  const cameraRef = useRef(null);

  // Pose detection state
  const [landmarks, setLandmarks] = useState([]);
  const [showSkeleton, setShowSkeleton] = useState(true);
  const [fps, setFps] = useState(30);

  // Animation state
  const animationRef = useRef(null);
  const frameCount = useRef(0);

  // No need for separate permission effect - using useCameraPermissions hook

  /**
   * Generate animated mock landmarks
   */
  const generateMockLandmarks = () => {
    const time = Date.now() / 1000;
    const centerX = screenWidth / 2;
    const centerY = screenHeight / 2;
    
    // Generate 17 mock landmarks (MoveNet format) with animation
    const mockLandmarks = [];
    const keypointNames = [
      'nose', 'left_eye', 'right_eye', 'left_ear', 'right_ear',
      'left_shoulder', 'right_shoulder', 'left_elbow', 'right_elbow',
      'left_wrist', 'right_wrist', 'left_hip', 'right_hip',
      'left_knee', 'right_knee', 'left_ankle', 'right_ankle'
    ];
    
    keypointNames.forEach((name, i) => {
      const angle = (i / 17) * Math.PI * 2 + time * 0.5; // Rotating animation
      const radius = 80 + Math.sin(time * 2 + i) * 30; // Pulsing animation
      
      mockLandmarks.push({
        x: centerX + Math.cos(angle) * radius,
        y: centerY + Math.sin(angle) * radius,
        visibility: 0.8 + Math.sin(time * 3 + i) * 0.2, // Varying confidence
      });
    });
    
    return mockLandmarks;
  };

  /**
   * Animation loop for mock pose detection
   */
  useEffect(() => {
    const animate = () => {
      const newLandmarks = generateMockLandmarks();
      setLandmarks(newLandmarks);
      
      // Update FPS counter
      frameCount.current++;
      if (frameCount.current % 30 === 0) {
        setFps(30); // Mock 30 FPS
      }
      
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  /**
   * Toggle camera type
   */
  const toggleCameraType = () => {
    setCameraType(current => 
      current === 'back' ? 'front' : 'back'
    );
  };

  if (!permission) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading camera...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionText}>We need your permission to show the camera</Text>
        <TouchableOpacity style={styles.button} onPress={requestPermission}>
          <Text style={styles.buttonText}>Grant Permission</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={onClose}>
          <Text style={styles.buttonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Camera View */}
      <CameraView
        style={styles.camera}
        facing={cameraType}
        ref={cameraRef}
      />

      {/* Simple Test Overlay */}
      <SuperSimpleOverlay
        width={screenWidth}
        height={screenHeight}
      />

      {/* Pose Landmarks Overlay */}
      <NativeOverlay
        landmarks={landmarks}
        width={screenWidth}
        height={screenHeight}
        showSkeleton={showSkeleton}
        jointRadius={8}
        modelType="movenet"
      />

      {/* Top Controls */}
      <View style={styles.topControls}>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Text style={styles.closeButtonText}>✕</Text>
        </TouchableOpacity>
        
        <View style={styles.infoContainer}>
          <Text style={styles.infoText}>FPS: {fps}</Text>
          <Text style={styles.infoText}>Landmarks: {landmarks.length}</Text>
          <Text style={styles.infoText}>🔴 Mock Detection</Text>
        </View>
      </View>

      {/* Bottom Controls */}
      <View style={styles.bottomControls}>
        <TouchableOpacity
          style={[styles.controlButton, styles.toggleButton]}
          onPress={() => setShowSkeleton(!showSkeleton)}
        >
          <Text style={styles.controlButtonText}>
            {showSkeleton ? 'Hide Skeleton' : 'Show Skeleton'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.controlButton, styles.flipButton]}
          onPress={toggleCameraType}
        >
          <Text style={styles.controlButtonText}>Flip</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  permissionContainer: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    color: '#fff',
    fontSize: 18,
  },
  permissionText: {
    color: '#fff',
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
  },
  topControls: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    zIndex: 1000,
  },
  closeButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  infoContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#fff',
  },
  infoText: {
    color: '#fff',
    fontSize: 12,
    marginBottom: 2,
  },
  bottomControls: {
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    zIndex: 1000,
  },
  controlButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: '#fff',
    minWidth: 100,
    alignItems: 'center',
  },
  toggleButton: {
    backgroundColor: '#FF6B35',
  },
  flipButton: {
    backgroundColor: '#007AFF',
  },
  controlButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default SimplePoseCamera;
