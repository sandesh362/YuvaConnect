import React, { useState } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { color } from '@/theme/colors';
import { radius } from '@/theme/radius';
import { space } from '@/theme/spacing';
import { Text } from './Text';

export type LineChartProps = {
  /** Series values, oldest → newest. */
  data: number[];
  /** Optional x-axis captions under the plot ("Jan"…"Jun"). */
  labels?: string[];
  height?: number;
  lineColor?: string;
  style?: StyleProp<ViewStyle>;
  testID?: string;
};

/**
 * Dependency-free line+area chart (Income Trend on Earnings). Pure Views so
 * it renders identically on web and native: soft skyline columns as the area
 * fill, rotated 2dp segments as the line, 8dp dots at each sample, caption
 * labels below. No axes, no gridlines — exactly the export.
 */
export function LineChart({ data, labels, height = 180, lineColor = color.primary, style, testID }: LineChartProps) {
  const [width, setWidth] = useState(0);
  const n = data.length;
  const max = Math.max(...data, 1);
  const pad = 14; // keeps dots inside the frame

  const point = (index: number) => {
    const x = n === 1 ? width / 2 : (index / (n - 1)) * width;
    const y = pad + (1 - data[index] / max) * (height - pad * 2);
    return { x, y };
  };

  const segments = width && n > 1
    ? Array.from({ length: n - 1 }, (_, index) => {
        const a = point(index);
        const b = point(index + 1);
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const length = Math.sqrt(dx * dx + dy * dy);
        const angle = (Math.atan2(dy, dx) * 180) / Math.PI;
        return { key: index, left: (a.x + b.x) / 2 - length / 2, top: (a.y + b.y) / 2 - 1, length, angle };
      })
    : [];

  const colWidth = n > 1 ? width / (n - 1) : width;

  return (
    <View testID={testID} style={[styles.wrap, style]}>
      <View style={{ height }} onLayout={(event) => setWidth(event.nativeEvent.layout.width)}>
        {width > 0
          ? data.map((_, index) => {
              const { x, y } = point(index);
              return (
                <View
                  key={`area-${index}`}
                  style={[
                    styles.areaCol,
                    {
                      left: x - colWidth / 2,
                      width: colWidth,
                      top: y,
                      height: Math.max(0, height - y),
                    },
                  ]}
                />
              );
            })
          : null}
        {segments.map((segment) => (
          <View
            key={segment.key}
            style={[
              styles.segment,
              {
                left: segment.left,
                top: segment.top,
                width: segment.length,
                backgroundColor: lineColor,
                transform: [{ rotate: `${segment.angle}deg` }],
              },
            ]}
          />
        ))}
        {width > 0
          ? data.map((_, index) => {
              const { x, y } = point(index);
              return <View key={`dot-${index}`} style={[styles.dot, { left: x - 4, top: y - 4, backgroundColor: lineColor }]} />;
            })
          : null}
      </View>
      {labels?.length ? (
        <View style={styles.labels}>
          {labels.map((label, index) => (
            <Text key={`${label}-${index}`} variant="caption" tone="tertiary" style={styles.label}>
              {label}
            </Text>
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: space.sm },
  areaCol: { position: 'absolute', backgroundColor: color.primarySoft },
  segment: { position: 'absolute', height: 2, borderRadius: radius.full },
  dot: { position: 'absolute', width: 8, height: 8, borderRadius: radius.full },
  labels: { flexDirection: 'row', justifyContent: 'space-between' },
  label: { flex: 1, textAlign: 'center' },
});

export default LineChart;
