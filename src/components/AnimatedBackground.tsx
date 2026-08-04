import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useMusicStore } from '../store/useMusicStore';
import { getTheme, palette } from '../theme';
import { useReducedMotion } from '../hooks/useReducedMotion';

export function AnimatedBackground() {
  const activeThemeColor = useMusicStore((state) => state.activeThemeColor);
  const isDarkMode = useMusicStore((state) => state.isDarkMode);
  const drift = useSharedValue(0);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    drift.value = reducedMotion ? 0 : withRepeat(withTiming(1, { duration: 9000, easing: Easing.inOut(Easing.quad) }), -1, true);
  }, [drift, reducedMotion]);

  const orbStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: drift.value * 28 },
      { translateY: drift.value * -18 },
      { scale: 1 + drift.value * 0.08 },
    ],
  }));

  const theme = getTheme(isDarkMode);

  return (
    <View style={[StyleSheet.absoluteFill, { backgroundColor: theme.background, pointerEvents: 'none' }]}>
      <LinearGradient
        colors={isDarkMode ? ['#180E22', palette.ink, '#0C0A10'] : ['#E7DDF7', palette.paper, '#F4F2EE']}
        locations={[0, 0.46, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.9, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <Animated.View style={[styles.orb, orbStyle, { backgroundColor: `${activeThemeColor}2C` }]} />
      <View style={[styles.orbSmall, { backgroundColor: `${palette.coral}1C` }]} />
      <View style={styles.grain} />
      <View style={styles.vignette}>
        <LinearGradient
          colors={['transparent', isDarkMode ? 'rgba(8,7,11,0.76)' : 'rgba(244,242,238,0.72)']}
          style={StyleSheet.absoluteFill}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  orb: {
    position: 'absolute',
    width: 340,
    height: 340,
    borderRadius: 170,
    top: -150,
    right: -150,
  },
  orbSmall: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    left: -150,
    top: 320,
  },
  grain: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    opacity: 0.05,
    backgroundColor: 'transparent',
  },
  vignette: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  },
});
