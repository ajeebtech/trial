import * as tf from '@tensorflow/tfjs';
import { MIN_POSE_CONFIDENCE, MIN_LANDMARK_CONFIDENCE } from './poseConstants';

/**
 * Loads the TensorFlow Lite model for pose detection
 * @param {string} modelUrl - URL or path to the TFLite model
 * @returns {Promise<tf.GraphModel>} - Loaded TensorFlow model
 */
export const loadPoseModel = async (modelUrl) => {
  try {
    console.log('Loading pose detection model from:', modelUrl);
    
    // For TensorFlow Lite models, we need to use loadLayersModel or loadGraphModel
    // depending on the model format
    let model;
    try {
      // Try loading as GraphModel first (most common for TFLite converted models)
      model = await tf.loadGraphModel(modelUrl);
      console.log('Loaded as GraphModel');
    } catch (graphError) {
      console.log('GraphModel loading failed, trying LayersModel...');
      // Fallback to LayersModel
      model = await tf.loadLayersModel(modelUrl);
      console.log('Loaded as LayersModel');
    }
    
    console.log('Pose model loaded successfully');
    console.log('Model input shape:', model.inputs?.[0]?.shape || 'Unknown');
    console.log('Model output shape:', model.outputs?.[0]?.shape || 'Unknown');
    
    return model;
  } catch (error) {
    console.error('Error loading pose model:', error);
    throw error;
  }
};

/**
 * Preprocesses camera frame for pose detection
 * @param {tf.Tensor} imageTensor - Input image tensor
 * @param {number} inputSize - Model input size (typically 256 or 192)
 * @returns {tf.Tensor} - Preprocessed tensor
 */
export const preprocessImage = (imageTensor, inputSize = 256) => {
  // Resize image to model input size
  const resized = tf.image.resizeBilinear(imageTensor, [inputSize, inputSize]);
  
  // Normalize pixel values to [0, 1]
  const normalized = resized.div(255.0);
  
  // Add batch dimension
  const batched = normalized.expandDims(0);
  
  return batched;
};

/**
 * Runs pose detection on preprocessed image
 * @param {tf.GraphModel} model - Loaded pose detection model
 * @param {tf.Tensor} inputTensor - Preprocessed image tensor
 * @returns {Promise<Object>} - Pose detection results
 */
export const detectPose = async (model, inputTensor) => {
  try {
    // Run inference
    const predictions = await model.predict(inputTensor);
    
    // Handle MoveNet output format
    let landmarks;
    
    if (Array.isArray(predictions)) {
      // Multiple outputs
      landmarks = predictions[0];
    } else {
      // Single output (typical for MoveNet)
      landmarks = predictions;
    }
    
    // Get the raw data
    const landmarkData = await landmarks.data();
    
    // MoveNet returns data in format [batch, 17, 3] where 3 = [y, x, confidence]
    // We need to convert this to our expected format
    const numKeypoints = 17; // MoveNet has 17 keypoints
    const processedLandmarks = [];
    
    for (let i = 0; i < numKeypoints; i++) {
      const baseIndex = i * 3;
      processedLandmarks.push({
        y: landmarkData[baseIndex],     // MoveNet outputs y first
        x: landmarkData[baseIndex + 1], // then x
        confidence: landmarkData[baseIndex + 2], // then confidence
      });
    }
    
    return {
      landmarks: processedLandmarks,
      modelType: 'movenet',
    };
  } catch (error) {
    console.error('Error during pose detection:', error);
    return null;
  }
};

/**
 * Converts normalized landmarks to screen coordinates
 * @param {Array} landmarks - Processed landmark objects from detectPose
 * @param {number} imageWidth - Original image width
 * @param {number} imageHeight - Original image height
 * @param {number} screenWidth - Screen/canvas width
 * @param {number} screenHeight - Screen/canvas height
 * @returns {Array} - Array of {x, y, visibility} landmark objects
 */
export const convertLandmarksToScreen = (
  landmarks,
  imageWidth,
  imageHeight,
  screenWidth,
  screenHeight
) => {
  if (!landmarks || !Array.isArray(landmarks)) {
    return [];
  }
  
  return landmarks.map(landmark => {
    // Convert normalized coordinates to screen coordinates
    const screenX = landmark.x * screenWidth;
    const screenY = landmark.y * screenHeight;
    
    return {
      x: screenX,
      y: screenY,
      visibility: landmark.confidence || landmark.visibility || 0,
    };
  });
};

/**
 * Filters landmarks based on confidence threshold
 * @param {Array} landmarks - Array of landmark objects
 * @param {number} threshold - Minimum confidence threshold
 * @returns {Array} - Filtered landmarks
 */
export const filterLandmarksByConfidence = (landmarks, threshold = MIN_LANDMARK_CONFIDENCE) => {
  return landmarks.filter(landmark => landmark.visibility >= threshold);
};

/**
 * Calculates the bounding box of detected pose
 * @param {Array} landmarks - Array of landmark objects
 * @returns {Object} - Bounding box {x, y, width, height}
 */
export const getPoseBoundingBox = (landmarks) => {
  if (!landmarks || landmarks.length === 0) {
    return null;
  }
  
  const validLandmarks = landmarks.filter(lm => lm.visibility > MIN_LANDMARK_CONFIDENCE);
  
  if (validLandmarks.length === 0) {
    return null;
  }
  
  const xs = validLandmarks.map(lm => lm.x);
  const ys = validLandmarks.map(lm => lm.y);
  
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  
  return {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY,
  };
};

/**
 * Smooths landmark positions using exponential moving average
 * @param {Array} currentLandmarks - Current frame landmarks
 * @param {Array} previousLandmarks - Previous frame landmarks
 * @param {number} alpha - Smoothing factor (0-1)
 * @returns {Array} - Smoothed landmarks
 */
export const smoothLandmarks = (currentLandmarks, previousLandmarks, alpha = 0.7) => {
  if (!previousLandmarks || previousLandmarks.length !== currentLandmarks.length) {
    return currentLandmarks;
  }
  
  return currentLandmarks.map((current, index) => {
    const previous = previousLandmarks[index];
    return {
      x: alpha * current.x + (1 - alpha) * previous.x,
      y: alpha * current.y + (1 - alpha) * previous.y,
      visibility: current.visibility,
    };
  });
};

/**
 * Debounces function calls to optimize performance
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} - Debounced function
 */
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};
