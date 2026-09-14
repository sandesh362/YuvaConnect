import React from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { color } from '@/theme/colors';
import { radius, shadow } from '@/theme/radius';
import { layout, space } from '@/theme/spacing';
import type { IconName } from '@/theme/icons';
import { Icon } from './Icon';
import { Text } from './Text';

export type StatBoxProps = {
  label: string;
  value: string;
  icon?: IconName;
  /**
   * `plain`  — bordered box, no icon well (Budget / Duration / Location /
   *            Deadline grid on Gig Details, exactly as drawn).
   * `tinted` — icon sits in a coloured well (dashboard KPI tiles).
   */
  variant?: 'plain' | 'tinted';
  tone?: 'brand' | 'success' | 'warning' | 'danger' | 'neutral';
  /** Optional helper line under the value ("Escrow protected"). */
  hint?: string;
  style?: StyleProp<ViewStyle>;
  testID?: string;
};

const TONES: Record<NonNullable<StatBoxProps['tone']>, { icon: string; well: string }> = {
  brand: { icon: color.primary, well: color.primarySoft },
  success: { icon: color.success, well: color.successSoft },
  warning: { icon: color.warningStrong, well: color.warningSoft },
  danger: { icon: color.danger, well: color.dangerSoft },
  neutral: { icon: color.textSecondary, well: color.surfaceMuted },
};

/**
 * One cell of a stat grid: individually bordered + rounded, uppercase
 * caption label above a bold value. Never plain text.
 */
export function StatBox({ label, value, icon, variant = 'plain', tone = 'brand', hint, style, testID }: StatBoxProps) {
  const skin = TONES[tone];
  return (
    <View testID={testID} style={[styles.box, variant === 'tinted' && styles.tinted, style]}>
      {icon && variant === 'tinted' ? (
        <View style={[styles.well, { backgroundColor: skin.well }]}>
          <Icon name={icon} size={17} color={skin.icon} />
        </View>
      ) : null}
      <View style={styles.body}>
        <View style={styles.labelRow}>
          {icon && variant === 'plain' ? <Icon name={icon} size={12} color={color.textTertiary} /> : null}
          <Text variant="overline" tone="tertiary" uppercase numberOfLines={1}>
            {label}
          </Text>
        </View>
        <Text variant="statValue" numberOfLines={2} style={styles.value}>
          {value}
        </Text>
        {hint ? (
          <Text variant="caption" tone="secondary" numberOfLines={1}>
            {hint}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

export type StatGridProps = {
  /** Exactly 4 items renders the 2x2 grid the wireframes use. */
  items: StatBoxProps[];
  columns?: 2 | 3 | 4;
  gap?: number;
  style?: StyleProp<ViewStyle>;
};

/**
 * Responsive stat grid. Default is the 2x2 layout from the Gig Details
 * wireframe; `columns={4}` gives the single-row KPI strip on dashboards.
 *
 * Items are chunked into explicit rows so the gutters never push a cell onto
 * the next line (percentage flex-basis + gap overflows in RN).
 */
export function StatGrid({ items, columns = 2, gap = space.md, style }: StatGridProps) {
  const rows: StatBoxProps[][] = [];
  for (let i = 0; i < items.length; i += columns) rows.push(items.slice(i, i + columns));

  return (
    <View style={[styles.grid, { gap }, style]}>
      {rows.map((row, index) => (
        <View key={row[0]?.label ?? index} style={[styles.row, { gap }]}>
          {row.map((item) => (
            <StatBox key={item.label} {...item} style={styles.cell} />
          ))}
          {/* Keep cell widths identical when the final row is short. */}
          {Array.from({ length: columns - row.length }).map((_, i) => (
            <View key={`filler-${i}`} style={styles.cell} />
          ))}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    flexGrow: 1,
    flexShrink: 1,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: color.border,
    backgroundColor: color.surface,
    padding: space.md,
    gap: space.sm,
  },
  tinted: { ...shadow.sm, borderColor: color.borderSubtle },
  well: {
    width: layout.statIconSize,
    height: layout.statIconSize,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: { gap: 2 },
  labelRow: { flexDirection: 'row', alignItems: 'center', gap: space.xs },
  value: { marginTop: 1 },
  grid: { flexDirection: 'column' },
  row: { flexDirection: 'row', alignItems: 'stretch' },
  cell: { flex: 1 },
});

export default StatBox;
