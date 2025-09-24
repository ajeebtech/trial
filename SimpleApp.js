import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function SimpleApp() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>🎉 NEW APP LOADED! 🎉</Text>
      <Text style={styles.subtitle}>If you see this, the changes worked!</Text>
      
      {/* Big red box */}
      <View style={styles.redBox}>
        <Text style={styles.boxText}>RED BOX</Text>
      </View>
      
      {/* Green box */}
      <View style={styles.greenBox}>
        <Text style={styles.boxText}>GREEN BOX</Text>
      </View>
      
      {/* Blue box */}
      <View style={styles.blueBox}>
        <Text style={styles.boxText}>BLUE BOX</Text>
      </View>
      
      <Text style={styles.footer}>This is completely different from before!</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFF00', // Bright yellow background
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
    textAlign: 'center',
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 18,
    color: '#333333',
    textAlign: 'center',
    marginBottom: 40,
  },
  redBox: {
    width: 200,
    height: 100,
    backgroundColor: '#FF0000',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 5,
    borderColor: '#000000',
  },
  greenBox: {
    width: 200,
    height: 100,
    backgroundColor: '#00FF00',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 5,
    borderColor: '#000000',
  },
  blueBox: {
    width: 200,
    height: 100,
    backgroundColor: '#0000FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
    borderWidth: 5,
    borderColor: '#000000',
  },
  boxText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  footer: {
    fontSize: 16,
    color: '#000000',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
