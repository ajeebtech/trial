import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { POSE_LANDMARKS, POSE_CONNECTIONS, POSE_COLORS } from '../utils/poseConstants';
import { 
  convertLandmarksToScreen, 
  filterLandmarksByConfidence, 
  getPoseBoundingBox,
  smoothLandmarks 
} from '../utils/poseUtils';

/**
 * Test component to verify pose detection utilities work correctly
 */
const PoseTestComponent = () => {
  const [testResults, setTestResults] = useState([]);

  const runTests = () => {
    const results = [];

    // Test 1: Pose constants
    results.push({
      test: 'Pose Constants',
      passed: Object.keys(POSE_LANDMARKS).length === 33 && POSE_CONNECTIONS.length > 0,
      details: `${Object.keys(POSE_LANDMARKS).length} landmarks, ${POSE_CONNECTIONS.length} connections`
    });

    // Test 2: Mock landmark conversion
    const mockLandmarks = new Float32Array([
      0.5, 0.5, 0.9, // Nose
      0.3, 0.3, 0.8, // Left eye
      0.7, 0.3, 0.8, // Right eye
    ]);
    
    const converted = convertLandmarksToScreen(mockLandmarks, 100, 100, 300, 400);
    results.push({
      test: 'Landmark Conversion',
      passed: converted.length === 3 && converted[0].x === 150 && converted[0].y === 200,
      details: `Converted ${converted.length} landmarks`
    });

    // Test 3: Confidence filtering
    const mockLandmarkObjects = [
      { x: 100, y: 100, visibility: 0.9 },
      { x: 200, y: 200, visibility: 0.3 },
      { x: 300, y: 300, visibility: 0.8 },
    ];
    
    const filtered = filterLandmarksByConfidence(mockLandmarkObjects, 0.5);
    results.push({
      test: 'Confidence Filtering',
      passed: filtered.length === 2,
      details: `Filtered to ${filtered.length} high-confidence landmarks`
    });

    // Test 4: Bounding box calculation
    const bbox = getPoseBoundingBox(mockLandmarkObjects);
    results.push({
      test: 'Bounding Box',
      passed: bbox && bbox.width === 200 && bbox.height === 200,
      details: `BBox: ${bbox ? `${bbox.width}x${bbox.height}` : 'null'}`
    });

    // Test 5: Landmark smoothing
    const current = [{ x: 100, y: 100, visibility: 0.9 }];
    const previous = [{ x: 90, y: 90, visibility: 0.9 }];
    const smoothed = smoothLandmarks(current, previous, 0.7);
    results.push({
      test: 'Landmark Smoothing',
      passed: smoothed[0].x === 97 && smoothed[0].y === 97,
      details: `Smoothed: (${smoothed[0].x}, ${smoothed[0].y})`
    });

    setTestResults(results);
  };

  useEffect(() => {
    runTests();
  }, []);

  const passedTests = testResults.filter(r => r.passed).length;
  const totalTests = testResults.length;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Pose Detection Test Suite</Text>
      
      <View style={styles.summary}>
        <Text style={styles.summaryText}>
          {passedTests}/{totalTests} tests passed
        </Text>
        <Text style={[
          styles.status, 
          { color: passedTests === totalTests ? '#4CAF50' : '#F44336' }
        ]}>
          {passedTests === totalTests ? '✅ All tests passed!' : '❌ Some tests failed'}
        </Text>
      </View>

      {testResults.map((result, index) => (
        <View key={index} style={styles.testResult}>
          <Text style={[styles.testName, { color: result.passed ? '#4CAF50' : '#F44336' }]}>
            {result.passed ? '✅' : '❌'} {result.test}
          </Text>
          <Text style={styles.testDetails}>{result.details}</Text>
        </View>
      ))}

      <TouchableOpacity style={styles.button} onPress={runTests}>
        <Text style={styles.buttonText}>Run Tests Again</Text>
      </TouchableOpacity>

      <View style={styles.info}>
        <Text style={styles.infoTitle}>Implementation Status:</Text>
        <Text style={styles.infoText}>✅ Pose constants and connections defined</Text>
        <Text style={styles.infoText}>✅ Utility functions implemented</Text>
        <Text style={styles.infoText}>✅ Skeleton overlay component ready</Text>
        <Text style={styles.infoText}>✅ Camera integration complete</Text>
        <Text style={styles.infoText}>⚠️ Using mock detection (replace with TFLite model)</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  summary: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    alignItems: 'center',
  },
  summaryText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  status: {
    fontSize: 16,
    fontWeight: '500',
    marginTop: 5,
  },
  testResult: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 6,
    marginBottom: 8,
  },
  testName: {
    fontSize: 16,
    fontWeight: '600',
  },
  testDetails: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  info: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginTop: 20,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
});

export default PoseTestComponent;
