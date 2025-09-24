import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'react-native';

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      <Stack screenOptions={{
        headerStyle: {
          backgroundColor: colorScheme === 'dark' ? '#1a1a1a' : '#fff',
        },
        headerTintColor: colorScheme === 'dark' ? '#fff' : '#000',
      }}>
        <Stack.Screen 
          name="(tabs)" 
          options={{ 
            headerShown: false,
          }} 
        />
        <Stack.Screen 
          name="camera" 
          options={{ 
            title: 'Camera',
            headerShown: true,
            headerStyle: {
              backgroundColor: '#000',
            },
            headerTintColor: '#fff',
          }} 
        />
      </Stack>
    </ThemeProvider>
  );
}
