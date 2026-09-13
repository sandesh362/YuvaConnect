import React from 'react';
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { color } from '@/theme/colors';
import type { IconName } from '@/theme/icons';
import { radius, shadow } from '@/theme/radius';
import { space } from '@/theme/spacing';
import { Icon } from './Icon';
import { Text } from './Text';

export type FileRowProps = {
  name: string;
  /** Caption under the name, e.g. "2.4 MB • Uploaded". */
  meta?: string;
  icon?: IconName;
  /** `uploaded` shows the navy tick; `pending` an outline circle. */
  state?: 'uploaded' | 'pending';
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  testID?: string;
};

/**
 * The document / deliverable row used by Student Verification (college ID),
 * Revision Requested (previous submission) and Business Verification uploads:
 * slate rounded tile with a file glyph, bold name, caption meta, state marker
 * on the right.
 */
export function FileRow({ name, meta, icon = 'idCard', state = 'uploaded', onPress, style, testID }: FileRowProps) {
  const body = (
    <>
      <View style={styles.tile}>
        <Icon name={icon} size={22} color={color.textSecondary} />
      </View>
      <View style={styles.copy}>
        <Text variant="calloutStrong" numberOfLines={1}>
          {name}
        </Text>
        {meta ? (
          <Text variant="caption" tone="secondary" numberOfLines={1}>
            {meta}
          </Text>
        ) : null}
      </View>
      {state === 'uploaded' ? (
        <View style={styles.tick}>
          <Icon name="check" size={14} color={color.textInverse} />
        </View>
      ) : (
        <View style={styles.pendingCircle} />
      )}
    </>
  );

  if (!onPress) {
    return (
      <View testID={testID} style={[styles.row, style]}>
        {body}
      </View>
    );
  }
  return (
    <Pressable testID={testID} onPress={onPress} accessibilityRole="button" accessibilityLabel={name} style={({ pressed }) => [styles.row, pressed && styles.pressed, style]}>
      {body}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    backgroundColor: color.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: color.borderSubtle,
    ...shadow.sm,
    padding: space.md,
  },
  pressed: { opacity: 0.85 },
  tile: {
    width: 56,
    height: 56,
    borderRadius: radius.md,
    backgroundColor: color.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  copy: { flex: 1, gap: 2 },
  tick: {
    width: 28,
    height: 28,
    borderRadius: radius.full,
    backgroundColor: color.textPrimary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pendingCircle: {
    width: 24,
    height: 24,
    borderRadius: radius.full,
    borderWidth: 2,
    borderColor: color.borderStrong,
  },
});

export default FileRow;
