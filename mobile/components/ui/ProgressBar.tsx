import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { colors, borderRadius } from '../../theme';

interface ProgressBarProps {
  progress: number; // 0-100
  color?: string;
  height?: number;
  bgColor?: string;
}

export function ProgressBar({
  progress, color = colors.primary, height = 6, bgColor = colors.surfaceBright,
}: ProgressBarProps) {
  const width = useSharedValue(0);

  useEffect(() => {
    width.value = withTiming(Math.min(progress, 100), { duration: 800 });
  }, [progress]);

  const animatedStyle = useAnimatedStyle(() => ({
    width: `${width.value}%`,
  }));

  const barColor = progress > 90 ? colors.error : progress > 70 ? colors.warning : color;

  return (
    <View style={[styles.track, { height, backgroundColor: bgColor }]}>
      <Animated.View style={[styles.fill, { backgroundColor: barColor, height }, animatedStyle]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    borderRadius: borderRadius.pill,
    overflow: 'hidden',
    width: '100%',
  },
  fill: {
    borderRadius: borderRadius.pill,
  },
});
