import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { color } from '@/theme/colors';
import { radius } from '@/theme/radius';
import { layout, space } from '@/theme/spacing';
import { Text } from './Text';

export type Segment<T extends string = string> = {
  key: T;
  label: string;
  /** Unread/pending count rendered as a small pill inside the segment. */
  count?: number;
};

export type SegmentedControlProps<T extends string = string> = {
  segments: Segment<T>[];
  activeKey: T;
  onChange: (key: T) => void;
  /** `pill` = white track with a sliding blue pill (filters);
   *  `underline` = text tabs with a blue rule (in-page tabs). */
  variant?: 'pill' | 'underline';
  style?: StyleProp<ViewStyle>;
  testID?: string;
};

/**
 * In-page tab switcher — "All · Pending · Active · Completed" on My
 * Applications, "Unread · All" on Notifications, and the Gig Filters scope.
 */
export function SegmentedControl<T extends string = string>({
  segments,
  activeKey,
  onChange,
  variant = 'pill',
  style,
  testID,
}: SegmentedControlProps<T>) {
  if (variant === 'underline') {
    return (
      <View testID={testID} style={[styles.underlineRow, style]} accessibilityRole="tablist">
        {segments.map((segment) => {
          const active = segment.key === activeKey;
          return (
            <Pressable
              key={segment.key}
              accessibilityRole="tab"
              accessibilityLabel={segment.label}
              accessibilityState={{ selected: active }}
              onPress={() => onChange(segment.key)}
              style={({ pressed }) => [styles.underlineTab, pressed && { opacity: 0.7 }]}>
              <View style={styles.underlineLabelRow}>
                <Text variant="label" tone={active ? 'brand' : 'secondary'} numberOfLines={1}>
                  {segment.label}
                </Text>
                {segment.count ? <CountPill count={segment.count} active={active} /> : null}
              </View>
              <View style={[styles.underlineRule, active && styles.underlineRuleActive]} />
            </Pressable>
          );
        })}
      </View>
    );
  }

  return (
    <View testID={testID} style={[styles.pillTrack, style]} accessibilityRole="tablist">
      {segments.map((segment) => {
        const active = segment.key === activeKey;
        return (
          <Pressable
            key={segment.key}
            accessibilityRole="tab"
            accessibilityLabel={segment.label}
            accessibilityState={{ selected: active }}
            onPress={() => onChange(segment.key)}
            style={({ pressed }) => [
              styles.pillTab,
              active && styles.pillTabActive,
              pressed && { opacity: 0.8 },
            ]}>
            <Text
              variant="label"
              numberOfLines={1}
              style={{ color: active ? color.textInverse : color.textSecondary, fontWeight: active ? '700' : '600' }}>
              {segment.label}
            </Text>
            {segment.count ? <CountPill count={segment.count} active={active} /> : null}
          </Pressable>
        );
      })}
    </View>
  );
}

function CountPill({ count, active }: { count: number; active: boolean }) {
  return (
    <View style={[styles.countPill, active && styles.countPillActive]}>
      <Text variant="overline" uppercase={false} style={[styles.countText, active && { color: color.textInverse }]}>
        {count > 99 ? '99+' : count}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pillTrack: {
    flexDirection: 'row',
    gap: space.xs,
    padding: space.xs,
    borderRadius: radius.full,
    backgroundColor: color.surfaceMuted,
    marginBottom: space.base,
  },
  pillTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    minHeight: layout.tapTarget,
    paddingVertical: 8,
    paddingHorizontal: space.md,
    borderRadius: radius.full,
  },
  pillTabActive: { backgroundColor: color.primary },

  underlineRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: color.divider,
    marginBottom: space.base,
  },
  underlineTab: { flex: 1, alignItems: 'center' },
  underlineLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: space.md },
  underlineRule: { height: 2, width: '100%', backgroundColor: 'transparent', marginBottom: -1 },
  underlineRuleActive: { backgroundColor: color.primary },

  countPill: {
    minWidth: 18,
    height: 18,
    paddingHorizontal: 5,
    borderRadius: radius.full,
    backgroundColor: color.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countPillActive: { backgroundColor: 'rgba(255,255,255,0.25)' },
  countText: { color: color.textSecondary, fontSize: 10, lineHeight: 12, fontWeight: '700' },
});

export default SegmentedControl;
