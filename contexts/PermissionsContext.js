import React, { createContext, useState, useEffect, useContext } from 'react';
import { Camera } from 'expo-camera';
import * as MediaLibrary from 'expo-media-library';
import { Alert, Platform, Linking } from 'react-native';

const PermissionsContext = createContext();

export const PermissionsProvider = ({ children }) => {
  const [cameraPermission, setCameraPermission] = useState(null);
  const [microphonePermission, setMicrophonePermission] = useState(null);
  const [mediaLibraryPermission, setMediaLibraryPermission] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const requestAllPermissions = async () => {
    try {
      setIsLoading(true);
      
      // Request camera and microphone permissions
      const { status: cameraStatus } = await Camera.requestCameraPermissionsAsync();
      const { status: audioStatus } = await Camera.requestMicrophonePermissionsAsync();
      
      // Request media library permission
      const { status: mediaStatus } = await MediaLibrary.requestPermissionsAsync(true);
      
      setCameraPermission(cameraStatus === 'granted');
      setMicrophonePermission(audioStatus === 'granted');
      setMediaLibraryPermission(mediaStatus === 'granted');
      
      return {
        camera: cameraStatus === 'granted',
        audio: audioStatus === 'granted',
        mediaLibrary: mediaStatus === 'granted',
        allGranted: cameraStatus === 'granted' && 
                   audioStatus === 'granted' && 
                   mediaStatus === 'granted'
      };
    } catch (error) {
      console.error('Error requesting permissions:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const checkAllPermissions = async () => {
    try {
      setIsLoading(true);
      
      // Check current permissions
      const { status: cameraStatus } = await Camera.getCameraPermissionsAsync();
      const { status: audioStatus } = await Camera.getMicrophonePermissionsAsync();
      const { status: mediaStatus } = await MediaLibrary.getPermissionsAsync();
      
      setCameraPermission(cameraStatus === 'granted');
      setMicrophonePermission(audioStatus === 'granted');
      setMediaLibraryPermission(mediaStatus === 'granted');
      
      return {
        camera: cameraStatus === 'granted',
        audio: audioStatus === 'granted',
        mediaLibrary: mediaStatus === 'granted',
        allGranted: cameraStatus === 'granted' && 
                   audioStatus === 'granted' && 
                   mediaStatus === 'granted'
      };
    } catch (error) {
      console.error('Error checking permissions:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const openSettings = () => {
    if (Platform.OS === 'ios') {
      Linking.openURL('app-settings:');
    } else {
      Linking.openSettings();
    }
  };

  const showPermissionAlert = (missingPermissions) => {
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
          onPress: openSettings,
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ]
    );
  };

  useEffect(() => {
    checkAllPermissions();
  }, []);

  return (
    <PermissionsContext.Provider
      value={{
        cameraPermission,
        microphonePermission,
        mediaLibraryPermission,
        isLoading,
        requestAllPermissions,
        checkAllPermissions,
        openSettings,
        showPermissionAlert,
      }}
    >
      {children}
    </PermissionsContext.Provider>
  );
};

export const usePermissions = () => {
  const context = useContext(PermissionsContext);
  if (!context) {
    throw new Error('usePermissions must be used within a PermissionsProvider');
  }
  return context;
};

export default PermissionsContext;
