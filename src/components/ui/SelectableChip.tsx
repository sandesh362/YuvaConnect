import React from 'react';
import { Pressable, ScrollView, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { color } from '@/theme/colors';
import { radius } from '@/theme/radius';
import { space } from '@/theme/spacing';
import type { IconName } from '@/theme/icons';
import { Icon } from './Icon';
import { Text } from './Text';

export type SelectableChipProps = {
  label: string;
  selected: boolean;
  onToggle: () => void;
  icon?: IconName;
  /** Shows a count beside the label ("Design · 12"). */
  count?: number;
  /** `check` renders a tick, `dot` a filled dot, `none` only recolours. */
  indicator?: 'check' | 'none';
  /**
   * Selected skin: `solid` = primary blue fill (filters, skills);
   * `soft` = primary-50 wash + blue check + blue label (review tags,
   * Post-a-Gig required skills).
   */
  selectedStyle?: 'solid' | 'soft';
  size?: 'sm' | 'md';
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  testID?: string;
};

/**
 * Filter/skill chip. Unselected = white with a slate border and slate text;
 * selected = solid primary blue with white text and a tick. Used on Gig
 * Filters, Student Skill Selection and Availability screens.
 */
export function SelectableChip({
  label,
  selected,
  onToggle,
  icon,
  count,
  indicator = 'check',
  selectedStyle = 'solid',
  size = 'md',
  disabled = false,
  style,
  testID,
}: SelectableChipProps) {
  return (
    <Pressable
      testID={testID}
      accessibilityRole="checkbox"
      accessibilityLabel={label}
      accessibilityState={{ selected, checked: selected, disabled }}
      disabled={disabled}
      onPress={onToggle}
      style={({ pressed }) => [
        styles.chip,
        size === 'sm' ? styles.chipSm : styles.chipMd,
        selected ? (selectedStyle === 'soft' ? styles.chipSelectedSoft : styles.chipSelected) : styles.chipIdle,
        pressed && { opacity: 0.75 },
        disabled && { opacity: 0.4 },
        style,
      ]}>
      {icon ? (
        <Icon
          name={icon}
          size={size === 'sm' ? 13 : 15}
          color={selected ? (selectedStyle === 'soft' ? color.primaryText : color.textInverse) : color.iconDefault}
        />
      ) : null}
      <Text
        variant={size === 'sm' ? 'caption' : 'label'}
        style={{
          color: selected ? (selectedStyle === 'soft' ? color.primaryText : color.textInverse) : color.textPrimary,
          fontWeight: selected ? '700' : '500',
        }}
        numberOfLines={1}>
        {label}
      </Text>
      {count !== undefined ? (
        <Text variant="caption" style={{ color: selected ? (selectedStyle === 'soft' ? color.primaryText : 'rgba(255,255,255,0.8)') : color.textTertiary }}>
          {count}
        </Text>
      ) : null}
      {selected && indicator === 'check' ? (
        <Icon name="check" size={size === 'sm' ? 13 : 15} color={selectedStyle === 'soft' ? color.primaryText : color.textInverse} />
      ) : null}
    </Pressable>
  );
}

/** Horizontally scrolling single-row chip rail (quick filters under search). */
export function ChipRail({
  chips,
  style,
  contentStyle,
}: {
  chips: SelectableChipProps[];
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
}) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={style}
      contentContainerStyle={[styles.rail, contentStyle]}>
      {chips.map((chip) => (
        <SelectableChip key={chip.label} {...chip} />
      ))}
    </ScrollView>
  );
}

/** Wrapping multi-select grid (skill selection, filter sheet). */
export function ChipGroup({
  chips,
  columns = 1,
  style,
}: {
  chips: SelectableChipProps[];
  columns?: number;
  style?: StyleProp<ViewStyle>;
}) {
  if (columns === 1) {
    return (
      <View style={[styles.group, style]}>
        {chips.map((chip) => (
          <SelectableChip key={chip.label} {...chip} />
        ))}
      </View>
    );
  }
  const rows: SelectableChipProps[][] = [];
  for (let i = 0; i < chips.length; i += columns) rows.push(chips.slice(i, i + columns));
  return (
    <View style={[styles.columnGroup, style]}>
      {rows.map((row, index) => (
        <View key={row[0]?.label ?? index} style={styles.groupRow}>
          {row.map((chip) => (
            <SelectableChip key={chip.label} {...chip} style={styles.groupCell} />
          ))}
          {Array.from({ length: columns - row.length }).map((_, i) => (
            <View key={`filler-${i}`} style={styles.groupCell} />
          ))}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: radius.full,
    borderWidth: 1.5,
    alignSelf: 'flex-start',
  },
  chipSm: { paddingHorizontal: space.md, paddingVertical: 6 },
  chipMd: { paddingHorizontal: space.base, paddingVertical: 9 },
  chipIdle: { backgroundColor: color.surface, borderColor: color.border },
  chipSelectedSoft: {
    backgroundColor: color.primarySoft,
    borderColor: color.primaryBorder,
  },
  chipSelected: { backgroundColor: color.primary, borderColor: color.primary },

  rail: { flexDirection: 'row', alignItems: 'center', gap: space.sm, paddingVertical: space.xs },
  group: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  columnGroup: { gap: space.sm },
  groupRow: { flexDirection: 'row', gap: space.sm },
  groupCell: { flex: 1, justifyContent: 'center', alignSelf: 'stretch' },
});

export default SelectableChip;
