import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  Alert,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { Camera, CameraType } from 'expo-camera';
import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-react-native';
import { decodeJpeg } from '@tensorflow/tfjs-react-native';
import SkeletonOverlay from './SkeletonOverlay';
import SimpleTestOverlay from './SimpleTestOverlay';
import NativeOverlay from './NativeOverlay';
import SuperSimpleOverlay from './SuperSimpleOverlay';
import {
  loadPoseModel,
  preprocessImage,
  detectPose,
  convertLandmarksToScreen,
  smoothLandmarks,
  debounce,
} from '../utils/poseUtils';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

/**
 * PoseDetectionCamera Component
 * Main camera component with real-time pose detection and skeleton overlay
 */
const PoseDetectionCamera = ({ onClose }) => {
  // Camera and permissions state
  const [hasPermission, setHasPermission] = useState(null);
  const [cameraType, setCameraType] = useState(CameraType.back);
  const cameraRef = useRef(null);

  // Pose detection state
  const [model, setModel] = useState(null);
  const [isModelLoading, setIsModelLoading] = useState(true);
  const [landmarks, setLandmarks] = useState([]);
  const [previousLandmarks, setPreviousLandmarks] = useState([]);
  const [isDetecting, setIsDetecting] = useState(false);

  // UI state
  const [showSkeleton, setShowSkeleton] = useState(true);
  const [fps, setFps] = useState(0);
  const [cameraReady, setCameraReady] = useState(false);

  // Test landmarks for debugging - make them more visible
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
  
  console.log('Test landmarks created:', testLandmarks.length, 'Screen size:', screenWidth, 'x', screenHeight);

  // Set test landmarks immediately for debugging
  useEffect(() => {
    console.log('Setting test landmarks immediately...');
    setLandmarks(testLandmarks);
  }, []);

  // Performance tracking
  const frameCount = useRef(0);
  const lastFpsUpdate = useRef(Date.now());
  const detectionInterval = useRef(null);

  /**
   * Initialize TensorFlow and load pose detection model
   */
  useEffect(() => {
    const initializeTensorFlow = async () => {
      try {
        // Initialize TensorFlow
        await tf.ready();
        console.log('TensorFlow initialized');

        // Load the actual TensorFlow model
        try {
          console.log('Loading TensorFlow.js compatible pose model...');
          
          // For now, let's use mock detection to ensure overlay works
          // We'll enable real model loading once we confirm the overlay is visible
          console.log('Using mock detection for testing overlay visibility');
          setModel({ mock: true });
          
          // Set test landmarks immediately for debugging
          console.log('Setting test landmarks for debugging');
          setLandmarks(testLandmarks);
          
          // TODO: Uncomment below to enable real model loading
          // const modelUrl = 'https://tfhub.dev/google/tfjs-model/movenet/singlepose/lightning/4';
          // const loadedModel = await loadPoseModel(modelUrl);
          // console.log('✅ Real TensorFlow.js model loaded successfully!');
          // setModel(loadedModel);
        } catch (modelError) {
          console.error('Failed to load TensorFlow.js model, falling back to mock:', modelError);
          console.log('Using mock detection instead');
          setModel({ mock: true });
        }
        setIsModelLoading(false);
      } catch (error) {
        console.error('Error initializing TensorFlow:', error);
        Alert.alert('Error', 'Failed to initialize pose detection model');
        setIsModelLoading(false);
      }
    };

    initializeTensorFlow();
  }, []);

  /**
   * Request camera permissions
   */
  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  /**
   * Mock pose detection function (replace with actual TFLite inference)
   */
  const mockPoseDetection = useCallback(() => {
    // Generate mock landmarks for demonstration (17 keypoints for MoveNet)
    const mockLandmarks = [];
    const centerX = screenWidth / 2;
    const centerY = screenHeight / 2;
    
    // Generate 17 mock landmarks (MoveNet format)
    const keypointNames = [
      'nose', 'left_eye', 'right_eye', 'left_ear', 'right_ear',
      'left_shoulder', 'right_shoulder', 'left_elbow', 'right_elbow',
      'left_wrist', 'right_wrist', 'left_hip', 'right_hip',
      'left_knee', 'right_knee', 'left_ankle', 'right_ankle'
    ];
    
    keypointNames.forEach((name, i) => {
      const angle = (i / 17) * Math.PI * 2;
      const radius = 80 + Math.sin(Date.now() / 1000 + i) * 30;
      
      mockLandmarks.push({
        x: (centerX + Math.cos(angle) * radius) / screenWidth, // Normalized coordinates
        y: (centerY + Math.sin(angle) * radius) / screenHeight,
        visibility: 0.8 + Math.random() * 0.2,
      });
    });
    
    return mockLandmarks;
  }, [screenWidth, screenHeight]);

  /**
   * Process camera frame for pose detection
   */
  const processFrame = useCallback(async () => {
    if (!cameraRef.current || !model || isDetecting) {
      return;
    }

    setIsDetecting(true);

    try {
      // Check if using real TFLite model or mock
      let detectionResults;
      
      if (model.mock) {
        // Using mock detection for demonstration
        const mockResults = mockPoseDetection();
        // Convert normalized mock coordinates to screen coordinates
        detectionResults = mockResults.map(landmark => ({
          x: landmark.x * screenWidth,
          y: landmark.y * screenHeight,
          visibility: landmark.visibility,
        }));
      } else {
        // Using real TensorFlow Lite model
        const imageUri = await cameraRef.current.takePictureAsync({
          base64: true,
          quality: 0.3,
          skipProcessing: true,
        });
        
        const imageTensor = decodeJpeg(tf.util.encodeString(imageUri.base64, 'base64'));
        const preprocessed = preprocessImage(imageTensor);
        const results = await detectPose(model, preprocessed);
        
        // Convert results to screen coordinates
        if (results && results.landmarks) {
          detectionResults = convertLandmarksToScreen(
            results.landmarks,
            imageTensor.shape[2], // MoveNet input width (typically 192 or 256)
            imageTensor.shape[1], // MoveNet input height
            screenWidth,
            screenHeight
          );
        } else {
          detectionResults = [];
        }
      }
      
      // Smooth landmarks for better visual stability
      const smoothedLandmarks = smoothLandmarks(
        detectionResults,
        previousLandmarks,
        0.7
      );
      
      // Debug logging
      if (smoothedLandmarks.length > 0) {
        console.log(`Generated ${smoothedLandmarks.length} landmarks`);
        console.log('First landmark:', smoothedLandmarks[0]);
      }
      
      setLandmarks(smoothedLandmarks);
      setPreviousLandmarks(smoothedLandmarks);
      
      // Update FPS counter
      frameCount.current++;
      const now = Date.now();
      if (now - lastFpsUpdate.current >= 1000) {
        setFps(frameCount.current);
        frameCount.current = 0;
        lastFpsUpdate.current = now;
      }
    } catch (error) {
      console.error('Error processing frame:', error);
    } finally {
      setIsDetecting(false);
    }
  }, [model, isDetecting, mockPoseDetection, previousLandmarks]);

  /**
   * Start continuous pose detection
   */
  const startDetection = useCallback(() => {
    console.log('Starting pose detection...');
    if (detectionInterval.current) {
      clearInterval(detectionInterval.current);
    }
    
    // Run detection at ~30 FPS (adjust for performance)
    detectionInterval.current = setInterval(processFrame, 33);
    console.log('Detection interval started');
  }, [processFrame]);

  /**
   * Stop pose detection
   */
  const stopDetection = useCallback(() => {
    if (detectionInterval.current) {
      clearInterval(detectionInterval.current);
      detectionInterval.current = null;
    }
  }, []);

  /**
   * Handle camera ready
   */
  const onCameraReady = useCallback(() => {
    console.log('Camera ready!');
    setCameraReady(true);
    if (model && !isModelLoading) {
      console.log('Model ready, starting detection...');
      startDetection();
    } else {
      console.log('Model not ready yet:', { model: !!model, isModelLoading });
    }
  }, [model, isModelLoading, startDetection]);

  /**
   * Start detection when model is loaded and camera is ready
   */
  useEffect(() => {
    if (model && !isModelLoading && cameraReady) {
      startDetection();
    }
    
    return () => {
      stopDetection();
    };
  }, [model, isModelLoading, cameraReady, startDetection, stopDetection]);

  /**
   * Toggle camera type (front/back)
   */
  const toggleCameraType = () => {
    setCameraType(current => 
      current === CameraType.back ? CameraType.front : CameraType.back
    );
  };

  /**
   * Reset camera and detection
   */
  const resetCamera = () => {
    stopDetection();
    setLandmarks([]);
    setPreviousLandmarks([]);
    setCameraReady(false);
    
    // Restart detection after a brief delay
    setTimeout(() => {
      if (cameraRef.current) {
        setCameraReady(true);
        startDetection();
      }
    }, 500);
  };

  // Loading state
  if (hasPermission === null || isModelLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>
          {hasPermission === null ? 'Requesting camera permission...' : 'Loading pose detection model...'}
        </Text>
      </View>
    );
  }

  // Permission denied
  if (hasPermission === false) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionText}>
          Camera permission is required for pose detection
        </Text>
        <TouchableOpacity style={styles.button} onPress={onClose}>
          <Text style={styles.buttonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Camera View */}
      <Camera
        style={styles.camera}
        type={cameraType}
        ref={cameraRef}
        onCameraReady={onCameraReady}
        ratio="16:9"
      />

      {/* Super Simple Test Overlay - Should definitely be visible */}
      <SuperSimpleOverlay
        width={screenWidth}
        height={screenHeight}
      />

      {/* Native Overlay - OUTSIDE camera component */}
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
          <Text style={styles.infoText}>
            Landmarks: {landmarks.length}
          </Text>
          <Text style={[styles.infoText, { 
            color: model?.mock ? '#FF6B6B' : '#4CAF50' 
          }]}>
            {model?.mock ? '🔴 Mock Detection' : '🟢 TFLite Model'}
          </Text>
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
          style={[styles.controlButton, styles.resetButton]}
          onPress={resetCamera}
        >
          <Text style={styles.controlButtonText}>Reset</Text>
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
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  loadingText: {
    color: '#fff',
    fontSize: 16,
    marginTop: 20,
    textAlign: 'center',
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
    padding: 20,
  },
  permissionText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
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
  },
  closeButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  infoContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  infoText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  bottomControls: {
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  controlButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 80,
    alignItems: 'center',
  },
  controlButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  toggleButton: {
    backgroundColor: 'rgba(0, 122, 255, 0.8)',
  },
  resetButton: {
    backgroundColor: 'rgba(255, 59, 48, 0.8)',
  },
  flipButton: {
    backgroundColor: 'rgba(52, 199, 89, 0.8)',
  },
});

export default PoseDetectionCamera;
