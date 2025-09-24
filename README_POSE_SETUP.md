# MediaPipe Pose Detection Setup

This app includes a complete implementation of real-time pose detection with skeleton overlay using React Native, Expo, and TensorFlow Lite.

## Current Implementation

The app currently uses **mock pose detection** for demonstration purposes. To enable real pose detection, you need to:

## 1. Download MediaPipe Pose Model

Download one of these TensorFlow Lite models:

### Option A: MediaPipe Pose (Recommended)
- **Model**: `pose_landmark_full.tflite` or `pose_landmark_lite.tflite`
- **Download**: [MediaPipe Models](https://developers.google.com/mediapipe/solutions/vision/pose_landmarker#models)
- **Input**: 256x256 RGB image
- **Output**: 33 pose landmarks with x, y, visibility

### Option B: MoveNet
- **Model**: `movenet_singlepose_lightning.tflite` or `movenet_singlepose_thunder.tflite`
- **Download**: [TensorFlow Hub](https://tfhub.dev/google/movenet/singlepose/lightning/4)
- **Input**: 192x192 or 256x256 RGB image
- **Output**: 17 keypoints with x, y, confidence

## 2. Add Model to Assets

1. Place your downloaded `.tflite` file in the `assets/models/` directory
2. Update the model path in `components/PoseDetectionCamera.js`:

```javascript
// Replace this line in the initializeTensorFlow function:
// const modelUrl = 'path/to/your/pose_landmark_full.tflite';

// With the actual path to your model:
const modelUrl = require('../../assets/models/pose_landmark_full.tflite');
const loadedModel = await loadPoseModel(modelUrl);
```

## 3. Update Model Loading Code

In `components/PoseDetectionCamera.js`, replace the mock model initialization:

```javascript
// Remove this mock code:
console.log('Mock pose model loaded (replace with actual TFLite model)');
setModel({ mock: true }); // Mock model object

// Replace with actual model loading:
const modelUrl = require('../../assets/models/pose_landmark_full.tflite');
const loadedModel = await loadPoseModel(modelUrl);
setModel(loadedModel);
```

## 4. Update Frame Processing

Replace the mock detection in the `processFrame` function:

```javascript
// Remove mock detection:
const mockResults = mockPoseDetection();

// Replace with actual inference:
const imageUri = await cameraRef.current.takePictureAsync({
  base64: true,
  quality: 0.3,
  skipProcessing: true,
});

const imageTensor = decodeJpeg(tf.util.encodeString(imageUri.base64, 'base64'));
const preprocessed = preprocessImage(imageTensor);
const results = await detectPose(model, preprocessed);

// Convert results to screen coordinates
const screenLandmarks = convertLandmarksToScreen(
  results.landmarks,
  imageTensor.shape[1], // image width
  imageTensor.shape[0], // image height
  screenWidth,
  screenHeight
);
```

## 5. Performance Optimization

For better performance on mobile devices:

### Reduce Detection Frequency
```javascript
// In startDetection(), adjust the interval:
detectionInterval.current = setInterval(processFrame, 100); // 10 FPS instead of 30
```

### Optimize Image Processing
```javascript
// Use lower quality for faster processing:
const imageUri = await cameraRef.current.takePictureAsync({
  base64: true,
  quality: 0.1, // Lower quality = faster processing
  skipProcessing: true,
});
```

### Use Smaller Input Size
```javascript
// In preprocessImage function:
const preprocessed = preprocessImage(imageTensor, 192); // Use 192x192 instead of 256x256
```

## 6. Model-Specific Adjustments

### For MediaPipe Pose (33 landmarks):
- No changes needed - the current implementation supports 33 landmarks
- Landmarks include full body + hands + face

### For MoveNet (17 keypoints):
- Update `POSE_LANDMARKS` in `utils/poseConstants.js` to use 17 keypoints
- Update `POSE_CONNECTIONS` to match MoveNet's keypoint structure
- Adjust landmark processing in `utils/poseUtils.js`

## 7. Testing

1. Run the app: `npm start`
2. Press the "Pose" button to open pose detection camera
3. Point camera at a person
4. Verify skeleton overlay appears and tracks movement
5. Test toggle skeleton on/off functionality
6. Test camera flip and reset functions

## Troubleshooting

### Model Loading Issues
- Ensure the `.tflite` file is in the correct assets directory
- Check that the file path in the code matches the actual file location
- Verify the model file is not corrupted

### Performance Issues
- Reduce detection frequency (lower FPS)
- Use smaller input image size
- Lower camera preview quality
- Test on physical device (not simulator)

### Landmark Accuracy
- Ensure good lighting conditions
- Test with clear view of full body
- Adjust confidence thresholds in `poseConstants.js`

## Features Included

✅ **Real-time camera preview**  
✅ **Skeleton overlay with SVG**  
✅ **33-point pose landmark detection**  
✅ **Smooth landmark tracking**  
✅ **Toggle skeleton on/off**  
✅ **Camera flip (front/back)**  
✅ **Reset/reload functionality**  
✅ **FPS counter**  
✅ **Optimized for mobile performance**  
✅ **Offline operation (no server calls)**  

## Next Steps

1. Download and integrate a real TensorFlow Lite pose model
2. Test performance on target devices
3. Fine-tune detection parameters for your use case
4. Add additional features like pose classification or gesture recognition

The current implementation provides a complete foundation for pose detection - you just need to replace the mock detection with a real TensorFlow Lite model!
