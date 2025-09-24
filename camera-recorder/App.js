import { StatusBar } from 'expo-status-bar';
import { useState, useRef, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Alert } from 'react-native';
import { Camera, CameraType } from 'expo-camera';
import * as MediaLibrary from 'expo-media-library';
import { Video } from 'expo-av';

export default function App() {
  const [hasCameraPermission, setHasCameraPermission] = useState(null);
  const [cameraRef, setCameraRef] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedVideo, setRecordedVideo] = useState(null);
  const [cameraType, setCameraType] = useState(CameraType.back);

  useEffect(() => {
    (async () => {
      const cameraStatus = await Camera.requestCameraPermissionsAsync();
      const audioStatus = await Camera.requestMicrophonePermissionsAsync();
      const mediaStatus = await MediaLibrary.requestPermissionsAsync();
      
      setHasCameraPermission(
        cameraStatus.status === 'granted' && 
        audioStatus.status === 'granted' &&
        mediaStatus.status === 'granted'
      );
    })();
  }, []);

  const startRecording = async () => {
    if (cameraRef) {
      try {
        setIsRecording(true);
        const video = await cameraRef.recordAsync({
          maxDuration: 60, // 1 minute max
          quality: Camera.Constants.VideoQuality['480p'],
        });
        setRecordedVideo(video.uri);
      } catch (error) {
        console.error('Failed to record video:', error);
      }
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    if (cameraRef) {
      cameraRef.stopRecording();
    }
  };

  const toggleCameraType = () => {
    setCameraType(current => (
      current === CameraType.back ? CameraType.front : CameraType.back
    ));
  };

  if (hasCameraPermission === null) {
    return <View style={styles.container}><Text>Requesting permissions...</Text></View>;
  }
  if (hasCameraPermission === false) {
    return <View style={styles.container}><Text>No access to camera</Text></View>;
  }

  return (
    <View style={styles.container}>
      <Camera 
        style={styles.camera} 
        type={cameraType}
        ref={ref => setCameraRef(ref)}
      >
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, isRecording ? styles.stopButton : styles.recordButton]}
            onPress={isRecording ? stopRecording : startRecording}
          >
            <Text style={styles.text}>{isRecording ? 'Stop' : 'Record'}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.flipButton}
            onPress={toggleCameraType}
          >
            <Text style={styles.text}>Flip</Text>
          </TouchableOpacity>
        </View>
      </Camera>
      
      {recordedVideo && (
        <View style={styles.previewContainer}>
          <Video
            source={{ uri: recordedVideo }}
            style={styles.preview}
            useNativeControls
            resizeMode="contain"
            isLooping
          />
        </View>
      )}
      
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  camera: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 32,
  },
  button: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 20,
  },
  recordButton: {
    backgroundColor: 'red',
  },
  stopButton: {
    backgroundColor: 'white',
    borderWidth: 4,
    borderColor: 'red',
  },
  flipButton: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 15,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: 'white',
    fontWeight: 'bold',
  },
  previewContainer: {
    height: 200,
    width: '100%',
    backgroundColor: 'black',
  },
  preview: {
    flex: 1,
  },
});
