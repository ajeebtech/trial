import { useState, useEffect, useRef, useCallback } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Alert, Linking, Platform, ActivityIndicator } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as MediaLibrary from 'expo-media-library';
// Note: expo-av is deprecated, using basic video preview
import { useRouter, useFocusEffect } from 'expo-router';

export function CameraScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [isLoading, setIsLoading] = useState(true);
  const cameraRef = useRef(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedVideo, setRecordedVideo] = useState(null);
  const [facing, setFacing] = useState('back');
  const [mediaLibraryPermission, setMediaLibraryPermission] = useState(false);
  const router = useRouter();

  const checkAndRequestPermissions = async () => {
    try {
      setIsLoading(true);
      
      // Request camera permissions using the new hook
      if (!permission?.granted) {
        const result = await requestPermission();
        if (!result.granted) {
          Alert.alert(
            'Camera Permission Required',
            'Camera access is required to record videos.',
            [
              {
                text: 'Open Settings',
                onPress: () => {
                  if (Platform.OS === 'ios') {
                    Linking.openURL('app-settings:');
                  } else {
                    Linking.openSettings();
                  }
                },
              },
              {
                text: 'Cancel',
                style: 'cancel',
              },
            ]
          );
          return false;
        }
      }
      
      // Request media library permission (write-only to avoid audio conflicts)
      const { status: mediaStatus } = await MediaLibrary.requestPermissionsAsync(true);
      const mediaLibrary = mediaStatus === 'granted';
      setMediaLibraryPermission(mediaLibrary);
      
      if (!mediaLibrary) {
        Alert.alert(
          'Media Library Permission',
          'Media library access is required to save videos. You can still record videos without this permission.',
          [
            {
              text: 'Open Settings',
              onPress: () => {
                if (Platform.OS === 'ios') {
                  Linking.openURL('app-settings:');
                } else {
                  Linking.openSettings();
                }
              },
            },
            {
              text: 'Continue',
              style: 'default',
            },
          ]
        );
      }
      
      return permission?.granted || false;
    } catch (error) {
      console.error('Error in checkAndRequestPermissions:', error);
      Alert.alert('Error', 'Failed to check permissions. Please try again.');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkAndRequestPermissions();
  }, []);

  useFocusEffect(
    useCallback(() => {
      // Check permissions when screen comes into focus
      checkAndRequestPermissions();
    }, [])
  );

  const startRecording = async () => {
    if (!cameraRef.current) {
      console.log('No camera reference');
      return;
    }
    
    try {
      console.log('Starting recording...');
      setIsRecording(true);
      
      const video = await cameraRef.current.recordAsync({
        maxDuration: 60, // 1 minute max
      });
      
      console.log('Recording finished, saving video...');
      setRecordedVideo(video.uri);
      
      if (!mediaLibraryPermission) {
        console.log('No media library permission, skipping save');
        Alert.alert(
          'Success', 
          'Video recorded! To save to your library, please grant media library access in settings.'
        );
        return;
      }
      
      // Save to media library
      try {
        console.log('Creating asset from video...');
        const asset = await MediaLibrary.createAssetAsync(video.uri);
        console.log('Asset created:', asset);
        
        // Get or create the album
        console.log('Getting or creating album...');
        let album = await MediaLibrary.getAlbumAsync('Camera Recorder');
        if (!album) {
          console.log('Creating new album...');
          album = await MediaLibrary.createAlbumAsync('Camera Recorder', asset, false);
          console.log('Album created:', album);
        } else {
          console.log('Adding to existing album...');
          await MediaLibrary.addAssetsToAlbumAsync([asset], album, false);
          console.log('Added to album');
        }
        
        Alert.alert('Success', 'Video saved to your library!');
      } catch (saveError) {
        console.error('Error saving video:', saveError);
        Alert.alert(
          'Warning', 
          'Video was recorded but could not be saved to your library. ' +
          'Please check that the app has permission to access your media library.'
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
    if (cameraRef.current && isRecording) {
      cameraRef.current.stopRecording();
    }
  };

  const toggleCameraType = () => {
    setFacing(current => 
      current === 'back' ? 'front' : 'back'
    );
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={styles.loadingText}>Checking permissions...</Text>
      </View>
    );
  }
  
  if (!permission?.granted) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={styles.permissionText}>
          Camera permission is required to use this feature.
        </Text>
        <TouchableOpacity 
          style={styles.button} 
          onPress={checkAndRequestPermissions}
        >
          <Text style={styles.buttonText}>Grant Permissions</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView 
        style={styles.camera} 
        facing={facing}
        ref={cameraRef}
        mode="video"
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
      </CameraView>
      
      {recordedVideo && (
        <View style={styles.previewContainer}>
          <Text style={styles.previewText}>
            Video recorded successfully!{'\n'}
            URI: {recordedVideo}
          </Text>
          <TouchableOpacity 
            style={styles.button}
            onPress={() => setRecordedVideo(null)}
          >
            <Text style={styles.buttonText}>Record Again</Text>
          </TouchableOpacity>
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
    backgroundColor: '#fff',
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
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
    paddingVertical: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
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
    position: 'absolute',
    bottom: 100,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.8)',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  previewText: {
    color: 'white',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 15,
  },
});
