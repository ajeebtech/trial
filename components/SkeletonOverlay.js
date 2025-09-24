import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Circle, Line, G } from 'react-native-svg';
import { POSE_CONNECTIONS, MOVENET_CONNECTIONS, POSE_COLORS, MIN_LANDMARK_CONFIDENCE } from '../utils/poseConstants';

/**
 * SkeletonOverlay Component
 * Renders pose landmarks and connections as an SVG overlay
 */
const SkeletonOverlay = ({ 
  landmarks, 
  width, 
  height, 
  showSkeleton = true,
  jointRadius = 4,
  strokeWidth = 2,
  opacity = 0.8,
  modelType = 'movenet' // 'movenet' or 'mediapipe'
}) => {
  // Debug logging
  console.log('SkeletonOverlay render:', {
    showSkeleton,
    landmarksCount: landmarks?.length || 0,
    modelType,
    width,
    height
  });

  // Don't render if no landmarks or skeleton is hidden
  if (!showSkeleton || !landmarks || landmarks.length === 0) {
    console.log('SkeletonOverlay: Not rendering - showSkeleton:', showSkeleton, 'landmarks:', landmarks?.length || 0);
    return null;
  }

  // Filter landmarks by confidence
  const validLandmarks = landmarks.filter(
    (landmark, index) => landmark && landmark.visibility >= MIN_LANDMARK_CONFIDENCE
  );

  console.log('Valid landmarks after filtering:', validLandmarks.length);

  if (validLandmarks.length === 0) {
    console.log('No valid landmarks to render');
    return null;
  }

  /**
   * Gets the color for a connection based on body part
   */
  const getConnectionColor = (startIndex, endIndex) => {
    // Face connections
    if (startIndex <= 10 && endIndex <= 10) {
      return POSE_COLORS.FACE;
    }
    
    // Torso connections
    if ((startIndex >= 11 && startIndex <= 12) || (startIndex >= 23 && startIndex <= 24)) {
      return POSE_COLORS.TORSO;
    }
    
    // Left arm connections
    if (startIndex >= 11 && startIndex <= 22 && startIndex % 2 === 1) {
      return POSE_COLORS.LEFT_ARM;
    }
    
    // Right arm connections
    if (startIndex >= 12 && startIndex <= 22 && startIndex % 2 === 0) {
      return POSE_COLORS.RIGHT_ARM;
    }
    
    // Left leg connections
    if (startIndex >= 23 && startIndex <= 32 && startIndex % 2 === 1) {
      return POSE_COLORS.LEFT_LEG;
    }
    
    // Right leg connections
    if (startIndex >= 24 && startIndex <= 32 && startIndex % 2 === 0) {
      return POSE_COLORS.RIGHT_LEG;
    }
    
    return POSE_COLORS.TORSO; // Default color
  };

  /**
   * Renders skeleton connections (lines between joints)
   */
  const renderConnections = () => {
    const connections = modelType === 'movenet' ? MOVENET_CONNECTIONS : POSE_CONNECTIONS;
    
    return connections.map((connection, index) => {
      const [startIdx, endIdx] = connection;
      const startLandmark = landmarks[startIdx];
      const endLandmark = landmarks[endIdx];

      // Only draw connection if both landmarks are valid
      if (
        !startLandmark || 
        !endLandmark ||
        startLandmark.visibility < MIN_LANDMARK_CONFIDENCE ||
        endLandmark.visibility < MIN_LANDMARK_CONFIDENCE
      ) {
        return null;
      }

      const color = getConnectionColor(startIdx, endIdx);

      return (
        <Line
          key={`connection-${index}`}
          x1={startLandmark.x}
          y1={startLandmark.y}
          x2={endLandmark.x}
          y2={endLandmark.y}
          stroke={color}
          strokeWidth={strokeWidth}
          strokeOpacity={opacity}
          strokeLinecap="round"
        />
      );
    }).filter(Boolean);
  };

  /**
   * Renders landmark points (joints as circles)
   */
  const renderLandmarks = () => {
    return landmarks.map((landmark, index) => {
      if (!landmark || landmark.visibility < MIN_LANDMARK_CONFIDENCE) {
        return null;
      }

      // Determine color based on landmark index
      let color = POSE_COLORS.TORSO;
      if (index <= 10) {
        color = POSE_COLORS.FACE;
      } else if (index >= 11 && index <= 22) {
        color = index % 2 === 1 ? POSE_COLORS.LEFT_ARM : POSE_COLORS.RIGHT_ARM;
      } else if (index >= 23 && index <= 32) {
        color = index % 2 === 1 ? POSE_COLORS.LEFT_LEG : POSE_COLORS.RIGHT_LEG;
      }

      return (
        <Circle
          key={`landmark-${index}`}
          cx={landmark.x}
          cy={landmark.y}
          r={jointRadius}
          fill={color}
          fillOpacity={opacity}
          stroke="#FFFFFF"
          strokeWidth={1}
          strokeOpacity={opacity * 0.8}
        />
      );
    }).filter(Boolean);
  };

  return (
    <View style={[styles.overlay, { width, height }]} pointerEvents="none">
      <Svg width={width} height={height} style={styles.svg}>
        <G>
          {/* Render connections first (behind joints) */}
          {renderConnections()}
          {/* Render landmarks on top */}
          {renderLandmarks()}
        </G>
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
  },
  svg: {
    position: 'absolute',
  },
});

export default SkeletonOverlay;
