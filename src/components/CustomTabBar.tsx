import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Animated, { FadeIn, LinearTransition } from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { BookOpen, Compass, Heart, SlidersHorizontal } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useMusicStore } from '../store/useMusicStore';
import { createShadow } from '../utils/shadows';
import { getTheme, palette, radii } from '../theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface CustomTabBarProps {
  activeTab: 'search' | 'favorites' | 'documentation' | 'settings';
  onTabChange: (tab: 'search' | 'favorites' | 'documentation' | 'settings') => void;
}

export function CustomTabBar({ activeTab, onTabChange }: CustomTabBarProps) {
  const insets = useSafeAreaInsets();
  const isDarkMode = useMusicStore((state) => state.isDarkMode);
  const hapticsEnabled = useMusicStore((state) => state.hapticsEnabled);
  const activeThemeColor = useMusicStore((state) => state.activeThemeColor);
  const theme = getTheme(isDarkMode);

  const tabs = [
    { key: 'search', label: 'Discover', icon: Compass },
    { key: 'favorites', label: 'Collection', icon: Heart },
    { key: 'documentation', label: 'Learn', icon: BookOpen },
    { key: 'settings', label: 'Studio', icon: SlidersHorizontal },
  ] as const;

  const handleTabPress = (tabKey: 'search' | 'favorites' | 'documentation' | 'settings') => {
    if (hapticsEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onTabChange(tabKey);
  };

  return (
    <View style={[styles.tabBarWrapper, { bottom: Math.max(12, insets.bottom), borderColor: theme.line }]}>
      <BlurView intensity={isDarkMode ? 65 : 80} tint={isDarkMode ? 'dark' : 'light'} style={[styles.blurContainer, { backgroundColor: isDarkMode ? 'rgba(13,12,17,0.86)' : 'rgba(255,255,255,0.78)' }]}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key;
          const IconComponent = tab.icon;

          return (
            <Pressable
              key={tab.key}
              onPress={() => handleTabPress(tab.key)}
              style={styles.tabItem}
              accessibilityRole="tab"
              accessibilityLabel={tab.label}
              accessibilityState={{ selected: isActive }}
            >
              <Animated.View layout={LinearTransition} style={[styles.iconContainer, isActive && { backgroundColor: palette.lime }]}> 
                <IconComponent
                  size={19}
                  strokeWidth={isActive ? 2.6 : 2}
                  color={isActive ? palette.ink : theme.muted}
                  fill={isActive && tab.key === 'favorites' ? palette.ink : 'transparent'}
                />
              </Animated.View>
              <Text
                style={[
                  styles.tabLabel,
                  {
                    color: isActive ? theme.text : theme.muted,
                    fontWeight: isActive ? '800' : '600',
                  },
                ]}
              >
                {tab.label}
              </Text>

              {isActive && <Animated.View entering={FadeIn} style={[styles.activeDot, { backgroundColor: activeThemeColor }]} />}
            </Pressable>
          );
        })}
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  tabBarWrapper: {
    position: 'absolute',
    maxWidth: 500,
    alignSelf: 'center',
    left: 20,
    right: 20,
    borderRadius: radii.lg,
    overflow: 'hidden',
    borderWidth: 1,
    ...createShadow('#000000', 6, 10, 0.2, 8),
    zIndex: 90,
  },
  blurContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 7,
    paddingHorizontal: 8,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 1,
    paddingHorizontal: 3,
    position: 'relative',
  },
  iconContainer: {
    width: 38,
    height: 32,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  tabLabel: {
    fontSize: 9.5,
    letterSpacing: 0.2,
  },
  activeDot: {
    width: 12,
    height: 2,
    borderRadius: 1,
    marginTop: 2,
  },
});
