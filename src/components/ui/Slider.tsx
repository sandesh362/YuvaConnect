import React, { useRef, useState } from 'react';
import { PanResponder, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { color } from '@/theme/colors';
import { radius } from '@/theme/radius';

export type SliderProps = {
  value: number;
  min?: number;
  max?: number;
  step?: number;
  onValueChange: (value: number) => void;
  style?: StyleProp<ViewStyle>;
  testID?: string;
};

const THUMB = 24;
const TRACK = 4;

/**
 * The blue range slider (Work Radius, Gig Filters distance). View-based so it
 * renders identically on web and native with no extra dependency: slate-200
 * track, primary fill, 24dp primary thumb.
 */
export function Slider({ value, min = 0, max = 100, step = 1, onValueChange, style, testID }: SliderProps) {
  const [width, setWidth] = useState(0);
  const startX = useRef(0);

  const apply = (x: number) => {
    if (!width) return;
    const ratio = Math.min(1, Math.max(0, x / width));
    const raw = min + ratio * (max - min);
    const snapped = Math.round(raw / step) * step;
    onValueChange(Math.min(max, Math.max(min, snapped)));
  };

  const pan = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (event) => {
        startX.current = event.nativeEvent.locationX;
        apply(event.nativeEvent.locationX);
      },
      onPanResponderMove: (_event, gesture) => {
        apply(startX.current + (gesture.moveX - gesture.x0));
      },
    }),
  ).current;

  const ratio = max === min ? 0 : (value - min) / (max - min);

  return (
    <View
      testID={testID}
      accessibilityRole="adjustable"
      accessibilityLabel={`Value ${value}`}
      accessibilityValue={{ min, max, now: value }}
      onLayout={(event) => setWidth(event.nativeEvent.layout.width)}
      style={[styles.hit, style]}
      {...pan.panHandlers}>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${ratio * 100}%` }]} />
      </View>
      <View style={[styles.thumb, { left: ratio * Math.max(0, width - THUMB) }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  hit: { height: THUMB + 8, justifyContent: 'center' },
  track: { height: TRACK, borderRadius: radius.full, backgroundColor: color.skeletonBase, overflow: 'hidden' },
  fill: { height: TRACK, borderRadius: radius.full, backgroundColor: color.primary },
  thumb: {
    position: 'absolute',
    width: THUMB,
    height: THUMB,
    borderRadius: radius.full,
    backgroundColor: color.primary,
    top: 4,
  },
});

export default Slider;
