import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

/**
 * Super simple overlay that should definitely be visible
 */
const SuperSimpleOverlay = ({ width, height }) => {
  console.log('SuperSimpleOverlay rendering with size:', width, height);
  
  return (
    <View style={[styles.overlay, { width, height }]} pointerEvents="none">
      {/* Big red box in center */}
      <View style={styles.centerBox}>
        <Text style={styles.text}>OVERLAY WORKS!</Text>
      </View>
      
      {/* Corner markers */}
      <View style={[styles.corner, styles.topLeft]} />
      <View style={[styles.corner, styles.topRight]} />
      <View style={[styles.corner, styles.bottomLeft]} />
      <View style={[styles.corner, styles.bottomRight]} />
      
      {/* Edge markers */}
      <View style={[styles.edge, { top: height/2 - 25, left: 0 }]} />
      <View style={[styles.edge, { top: height/2 - 25, right: 0 }]} />
      <View style={[styles.edge, { bottom: 0, left: width/2 - 25 }]} />
      <View style={[styles.edge, { top: 0, left: width/2 - 25 }]} />
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 9999,
    backgroundColor: 'rgba(255, 0, 0, 0.2)', // Red tint
  },
  centerBox: {
    position: 'absolute',
    top: '40%',
    left: '25%',
    width: '50%',
    height: 100,
    backgroundColor: '#FF0000',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 5,
    borderColor: '#FFFFFF',
    borderRadius: 10,
  },
  text: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  corner: {
    position: 'absolute',
    width: 30,
    height: 30,
    backgroundColor: '#00FF00',
    borderRadius: 15,
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  topLeft: {
    top: 20,
    left: 20,
  },
  topRight: {
    top: 20,
    right: 20,
  },
  bottomLeft: {
    bottom: 20,
    left: 20,
  },
  bottomRight: {
    bottom: 20,
    right: 20,
  },
  edge: {
    position: 'absolute',
    width: 50,
    height: 50,
    backgroundColor: '#0000FF',
    borderRadius: 25,
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
});

export default SuperSimpleOverlay;
