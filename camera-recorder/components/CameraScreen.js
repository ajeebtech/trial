import { useState, useRef, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Alert, Platform } from 'react-native';
import { Camera } from 'expo-camera';
import * as MediaLibrary from 'expo-media-library';
import { Video } from 'expo-av';
import { useRouter } from 'expo-router';

// Define CameraType if not available (for web compatibility)
const CameraType = {
  back: 'back',
  front: 'front'
};

export function CameraScreen() {
  const [hasCameraPermission, setHasCameraPermission] = useState(null);
  const [cameraRef, setCameraRef] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedVideo, setRecordedVideo] = useState(null);
  const [type, setType] = useState(CameraType.back);
  const router = useRouter();

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
        // Save the video to the media library
        await MediaLibrary.saveToLibraryAsync(video.uri);
        Alert.alert('Success', 'Video saved to your library!');
      } catch (error) {
        console.error('Failed to record video:', error);
        Alert.alert('Error', 'Failed to record video. Please try again.');
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
    setType(current => 
      current === CameraType.back ? CameraType.front : CameraType.back
    );
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
        type={type}
        ref={ref => setCameraRef(ref)}
        ratio="16:9"
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
      
      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => router.back()}
      >
        <Text style={styles.text}>Back</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
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
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 15,
    borderRadius: 10,
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
