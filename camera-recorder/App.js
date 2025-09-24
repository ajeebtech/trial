import { StatusBar } from 'expo-status-bar';
import { useState, useRef, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Alert, ActivityIndicator, Platform, Linking } from 'react-native';
import { Camera, CameraType } from 'expo-camera';
import * as MediaLibrary from 'expo-media-library';
import { Video } from 'expo-av';

export default function App() {
  const [hasPermission, setHasPermission] = useState(null);
  const [cameraRef, setCameraRef] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedVideo, setRecordedVideo] = useState(null);
  const [cameraType, setCameraType] = useState(CameraType.back);
  const [permissions, setPermissions] = useState({
    camera: null,
    audio: null,
    mediaLibrary: null
  });

  useEffect(() => {
    (async () => {
      try {
        // Request camera and microphone permissions
        const { status: cameraStatus } = await Camera.requestCameraPermissionsAsync();
        const { status: audioStatus } = await Camera.requestMicrophonePermissionsAsync();
        
        // Request media library permission
        const { status: mediaStatus } = await MediaLibrary.requestPermissionsAsync();
        
        setPermissions({
          camera: cameraStatus === 'granted',
          audio: audioStatus === 'granted',
          mediaLibrary: mediaStatus === 'granted'
        });
        
        setHasPermission(
          cameraStatus === 'granted' && 
          audioStatus === 'granted' &&
          mediaStatus === 'granted'
        );
      } catch (error) {
        console.error('Error requesting permissions:', error);
        Alert.alert('Error', 'Failed to request permissions. Please try again.');
      }
    })();
  }, []);

  const startRecording = async () => {
    if (!cameraRef) {
      console.log('No camera reference');
      return;
    }
    
    try {
      console.log('Starting recording...');
      setIsRecording(true);
      
      const video = await cameraRef.recordAsync({
        maxDuration: 60, // 1 minute max
        quality: Camera.Constants.VideoQuality['480p'],
        mute: !permissions.audio, // Only mute if we don't have audio permission
      });
      
      console.log('Recording finished:', video.uri);
      setRecordedVideo(video.uri);
      
      // Save to media library if permission is granted
      if (permissions.mediaLibrary) {
        try {
          const asset = await MediaLibrary.createAssetAsync(video.uri);
          const album = await MediaLibrary.getAlbumAsync('Camera Recorder');
          
          if (album) {
            await MediaLibrary.addAssetsToAlbumAsync([asset], album, false);
          } else {
            await MediaLibrary.createAlbumAsync('Camera Recorder', asset, false);
          }
          
          Alert.alert('Success', 'Video saved to your photo library!');
        } catch (saveError) {
          console.error('Error saving video:', saveError);
          Alert.alert('Warning', 'Video was recorded but could not be saved to your library.');
        }
      } else {
        Alert.alert(
          'Success',
          'Video was recorded but not saved. Please grant media library access to save videos.'
        );
      }
    } catch (error) {
      console.error('Failed to record video:', error);
      Alert.alert('Error', 'Failed to record video. Please try again.');
    } finally {
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    if (cameraRef && isRecording) {
      cameraRef.stopRecording();
    }
  };

  const toggleCameraType = () => {
    setCameraType(current => (
      current === CameraType.back ? CameraType.front : CameraType.back
    ));
  };

  const openSettings = () => {
    if (Platform.OS === 'ios') {
      Linking.openURL('app-settings:');
    } else {
      Linking.openSettings();
    }
  };

  if (hasPermission === null) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={styles.loadingText}>Requesting permissions...</Text>
      </View>
    );
  }
  
  if (hasPermission === false) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionText}>
          {!permissions.camera && '• Camera access is required\n'}
          {!permissions.audio && '• Microphone access is required\n'}
          {!permissions.mediaLibrary && '• Media library access is required'}
        </Text>
        <TouchableOpacity 
          style={styles.button} 
          onPress={async () => {
            const { status: cameraStatus } = await Camera.requestCameraPermissionsAsync();
            const { status: audioStatus } = await Camera.requestMicrophonePermissionsAsync();
            const { status: mediaStatus } = await MediaLibrary.requestPermissionsAsync();
            
            setPermissions({
              camera: cameraStatus === 'granted',
              audio: audioStatus === 'granted',
              mediaLibrary: mediaStatus === 'granted'
            });
            
            setHasPermission(
              cameraStatus === 'granted' && 
              audioStatus === 'granted' &&
              mediaStatus === 'granted'
            );
          }}
        >
          <Text style={styles.buttonText}>Grant Permissions</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.button, styles.settingsButton]} 
          onPress={openSettings}
        >
          <Text style={styles.buttonText}>Open Settings</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {recordedVideo ? (
        <View style={styles.videoContainer}>
          <Video
            source={{ uri: recordedVideo }}
            style={styles.video}
            useNativeControls
            resizeMode="contain"
            isLooping
          />
          <View style={styles.controls}>
            <TouchableOpacity
              style={[styles.controlButton, styles.retakeButton]}
              onPress={() => setRecordedVideo(null)}
            >
              <Text style={styles.controlButtonText}>Retake</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <Camera 
          style={styles.camera} 
          type={cameraType}
          ref={ref => setCameraRef(ref)}
          ratio="16:9"
        >
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.controlButton, styles.recordButton]}
              onPress={isRecording ? stopRecording : startRecording}
            >
              <View style={isRecording ? styles.stopIcon : styles.recordIcon} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.controlButton, styles.flipButton]}
              onPress={toggleCameraType}
            >
              <Text style={styles.flipText}>Flip</Text>
            </TouchableOpacity>
          </View>
        </Camera>
      )}
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  permissionText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  button: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 200,
    alignItems: 'center',
    marginBottom: 10,
  },
  settingsButton: {
    backgroundColor: '#666',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  camera: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  videoContainer: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
  },
  video: {
    flex: 1,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  controlButton: {
    marginHorizontal: 20,
    padding: 15,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  recordButton: {
    backgroundColor: 'rgba(255, 59, 48, 0.7)',
    width: 70,
    height: 70,
    borderRadius: 35,
  },
  stopButton: {
    backgroundColor: '#ff3b30',
    width: 40,
    height: 40,
    borderRadius: 8,
  },
  flipButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 15,
  },
  retakeButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  recordIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#ff3b30',
  },
  stopIcon: {
    width: 30,
    height: 30,
    backgroundColor: '#fff',
    borderRadius: 4,
  },
  flipText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  controlButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  controls: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    padding: 20,
  },
});
