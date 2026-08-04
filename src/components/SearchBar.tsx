import React, { useState } from 'react';
import { View, TextInput, StyleSheet, Pressable, Text } from 'react-native';
import { BlurView } from 'expo-blur';
import { Search, X } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useMusicStore } from '../store/useMusicStore';
import { createShadow } from '../utils/shadows';
import { getTheme, palette, radii } from '../theme';

interface SearchBarProps {
  onSearch: (text: string) => void;
}

export function SearchBar({ onSearch }: SearchBarProps) {
  const searchQuery = useMusicStore((state) => state.searchQuery);
  const setSearchQuery = useMusicStore((state) => state.setSearchQuery);
  const isDarkMode = useMusicStore((state) => state.isDarkMode);
  const activeThemeColor = useMusicStore((state) => state.activeThemeColor);
  const hapticsEnabled = useMusicStore((state) => state.hapticsEnabled);
  const theme = getTheme(isDarkMode);

  const [text, setText] = useState(searchQuery);
  const [focused, setFocused] = useState(false);
  const focusShadow = createShadow(
    activeThemeColor,
    3,
    focused ? 14 : 10,
    focused ? 0.4 : 0.15,
    3,
  );

  const submitSearch = () => {
    const nextQuery = text.trim();
    setText(nextQuery);
    setSearchQuery(nextQuery);
    onSearch(nextQuery);
  };

  const handleChangeText = (val: string) => {
    if (val.length === 1 && text.length === 0 && hapticsEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setText(val);
  };

  const handleClear = () => {
    if (hapticsEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    setText('');
    onSearch('');
    setSearchQuery('');
  };

  return (
    <View style={[styles.container, focusShadow, { borderColor: focused ? activeThemeColor : theme.line }]}>
      <BlurView intensity={isDarkMode ? 45 : 70} tint={isDarkMode ? 'dark' : 'light'} style={[styles.blurInner, { backgroundColor: isDarkMode ? 'rgba(24,22,29,0.76)' : 'rgba(255,255,255,0.76)' }]}>
        <View style={[styles.searchIconBox, { backgroundColor: activeThemeColor }]}>
          <Search size={17} strokeWidth={2.8} color={palette.ink} />
        </View>
        
        <TextInput
          value={text}
          onChangeText={handleChangeText}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder="Search your next obsession"
          placeholderTextColor={theme.muted}
          style={[styles.input, { color: theme.text }]}
          returnKeyType="search"
          onSubmitEditing={submitSearch}
          accessibilityLabel="Search songs and artists"
          accessibilityHint="Type a search, then press the search key"
        />

        {text.length > 0 && (
          <Pressable onPress={handleClear} style={styles.clearBtn} hitSlop={10} accessibilityRole="button" accessibilityLabel="Clear search">
            <X size={14} color={theme.muted} />
          </Pressable>
        )}
        <Pressable onPress={submitSearch} style={[styles.shortcut, { borderColor: theme.line, backgroundColor: activeThemeColor }]} accessibilityRole="button" accessibilityLabel="Search">
          <Text style={[styles.shortcutText, { color: palette.ink }]}>GO</Text>
        </Pressable>
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
    marginVertical: 10,
    borderRadius: radii.md,
    borderWidth: 1,
    overflow: 'hidden',
  },
  blurInner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  searchIconBox: {
    width: 38,
    height: 38,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'System',
    paddingVertical: 4,
  },
  clearBtn: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 2,
    borderRadius: 12,
    backgroundColor: 'rgba(150, 150, 150, 0.2)',
  },
  shortcut: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 7,
    minHeight: 34,
    justifyContent: 'center',
    marginLeft: 5,
  },
  shortcutText: {
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
});
