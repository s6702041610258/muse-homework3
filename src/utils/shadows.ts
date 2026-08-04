import { Platform, ViewStyle } from 'react-native';

export function createShadow(
  color: string,
  offsetY: number,
  radius: number,
  opacity: number,
  elevation: number
): ViewStyle {
  if (Platform.OS === 'web') {
    return {
      boxShadow: `0px ${offsetY}px ${radius}px rgba(0, 0, 0, ${opacity})`,
    } as any;
  }
  return {
    shadowColor: color,
    shadowOffset: { width: 0, height: offsetY },
    shadowOpacity: opacity,
    shadowRadius: radius,
    elevation,
  };
}
