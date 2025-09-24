import { Camera } from 'expo-camera';
import * as MediaLibrary from 'expo-media-library';
import { Alert, Platform, Linking } from 'react-native';

export const requestCameraAndAudioPermissions = async () => {
  try {
    console.log('Requesting camera permission...');
    const { status: cameraStatus } = await Camera.requestCameraPermissionsAsync();
    console.log('Camera permission status:', cameraStatus);
    
    console.log('Requesting microphone permission...');
    const { status: audioStatus } = await Camera.requestMicrophonePermissionsAsync();
    console.log('Microphone permission status:', audioStatus);
    
    return {
      camera: cameraStatus === 'granted',
      audio: audioStatus === 'granted',
      allGranted: cameraStatus === 'granted' && audioStatus === 'granted'
    };
  } catch (error) {
    console.error('Error requesting camera/audio permissions:', error);
    throw error;
  }
};

export const requestMediaLibraryPermissions = async () => {
  try {
    console.log('Requesting media library permission...');
    const { status, canAskAgain } = await MediaLibrary.requestPermissionsAsync(true);
    console.log('Media library permission status:', status);
    
    return {
      granted: status === 'granted',
      canAskAgain
    };
  } catch (error) {
    console.error('Error requesting media library permissions:', error);
    throw error;
  }
};

export const showPermissionAlert = (missingPermissions) => {
  const messages = [];
  
  if (missingPermissions.camera) {
    messages.push('• Camera access is required to record videos');
  }
  if (missingPermissions.audio) {
    messages.push('• Microphone access is required to record audio');
  }
  if (missingPermissions.mediaLibrary) {
    messages.push('• Media library access is required to save videos');
  }
  
  Alert.alert(
    'Permissions Required',
    `Please grant the following permissions to use this feature:\n\n${messages.join('\n')}`,
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
};

export const checkAllPermissions = async () => {
  try {
    const cameraAudio = await requestCameraAndAudioPermissions();
    const mediaLib = await requestMediaLibraryPermissions();
    
    const result = {
      camera: cameraAudio.camera,
      audio: cameraAudio.audio,
      mediaLibrary: mediaLib.granted,
      allGranted: cameraAudio.allGranted && mediaLib.granted
    };
    
    console.log('Permission check result:', result);
    return result;
  } catch (error) {
    console.error('Error checking permissions:', error);
    throw error;
  }
};
