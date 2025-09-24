import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Circle, Line } from 'react-native-svg';

/**
 * Simple test overlay to verify SVG rendering works
 */
const SimpleTestOverlay = ({ width, height }) => {
  console.log('SimpleTestOverlay rendering with dimensions:', width, height);
  
  return (
    <View style={[styles.overlay, { width, height }]} pointerEvents="none">
      <Svg width={width} height={height} style={styles.svg}>
        {/* Test circle in center */}
        <Circle
          cx={width / 2}
          cy={height / 2}
          r={20}
          fill="#FF0000"
          stroke="#FFFFFF"
          strokeWidth={2}
        />
        
        {/* Test line */}
        <Line
          x1={width * 0.3}
          y1={height * 0.3}
          x2={width * 0.7}
          y2={height * 0.7}
          stroke="#00FF00"
          strokeWidth={4}
        />
        
        {/* Corner markers */}
        <Circle cx={50} cy={50} r={10} fill="#0000FF" />
        <Circle cx={width - 50} cy={50} r={10} fill="#0000FF" />
        <Circle cx={50} cy={height - 50} r={10} fill="#0000FF" />
        <Circle cx={width - 50} cy={height - 50} r={10} fill="#0000FF" />
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 10,
    backgroundColor: 'rgba(255, 255, 0, 0.1)', // Slight yellow tint for debugging
  },
  svg: {
    position: 'absolute',
  },
});

export default SimpleTestOverlay;
