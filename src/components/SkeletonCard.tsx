import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  interpolate,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useMusicStore } from '../store/useMusicStore';
import { useReducedMotion } from '../hooks/useReducedMotion';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export function SkeletonCard() {
  const isDarkMode = useMusicStore((state) => state.isDarkMode);
  const shimmerValue = useSharedValue(0);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    shimmerValue.value = reducedMotion ? 0 : withRepeat(withTiming(1, { duration: 1200 }), -1, false);
  }, [reducedMotion, shimmerValue]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: interpolate(shimmerValue.value, [0, 1], [-SCREEN_WIDTH, SCREEN_WIDTH]) }],
  }));

  const bgCard = isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)';
  const highlightColor = isDarkMode ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.1)';

  return (
    <View style={[styles.card, { backgroundColor: bgCard }]}>
      <View style={[styles.artwork, { backgroundColor: highlightColor }]} />
      <View style={styles.info}>
        <View style={[styles.titlePlaceholder, { backgroundColor: highlightColor }]} />
        <View style={[styles.artistPlaceholder, { backgroundColor: highlightColor }]} />
      </View>
      <Animated.View style={[StyleSheet.absoluteFill, animatedStyle]}>
        <LinearGradient
          colors={['transparent', highlightColor, 'transparent']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginHorizontal: 16,
    marginVertical: 6,
    borderRadius: 16,
    overflow: 'hidden',
  },
  artwork: {
    width: 60,
    height: 60,
    borderRadius: 12,
  },
  info: {
    flex: 1,
    marginLeft: 14,
    justifyContent: 'center',
  },
  titlePlaceholder: {
    height: 16,
    width: '70%',
    borderRadius: 8,
    marginBottom: 8,
  },
  artistPlaceholder: {
    height: 12,
    width: '45%',
    borderRadius: 6,
  },
});
