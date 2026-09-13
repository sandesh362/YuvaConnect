import React from 'react';
import { Image, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { avatarTint, color, initialsOf, tint } from '@/theme/colors';
import { radius } from '@/theme/radius';
import { layout } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { Text } from './Text';

export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

const SIZE: Record<AvatarSize, number> = {
  xs: layout.avatarXs,
  sm: layout.avatarSm,
  md: layout.avatarMd,
  lg: layout.avatarLg,
  xl: layout.avatarXl,
};

const FONT: Record<AvatarSize, number> = {
  xs: 10,
  sm: 12,
  md: 14,
  lg: 20,
  xl: 28,
};

export type AvatarProps = {
  /** Display name — initials and the deterministic tint are derived from it. */
  name: string;
  /** Optional remote photo (Cloudinary URL). Falls back to initials. */
  uri?: string | null;
  size?: AvatarSize;
  /**
   * The wireframes use a small SQUARE business icon on GigCards and a ROUND
   * avatar for people. `shape` selects between them.
   */
  shape?: 'circle' | 'square';
  /** Override the auto-derived tint. */
  tone?: string;
  style?: StyleProp<ViewStyle>;
  testID?: string;
};

/**
 * Initials-or-photo avatar. Tint is a stable hash of the name so the same
 * business/student always renders the same colour — the API has no avatar
 * colour field.
 */
export function Avatar({ name, uri, size = 'md', shape = 'circle', tone, style, testID }: AvatarProps) {
  const px = SIZE[size];
  const base = tone ?? avatarTint(name || 'YC');
  const corner = shape === 'square' ? Math.round(px * 0.28) : radius.full;

  return (
    <View
      testID={testID}
      accessibilityRole="image"
      accessibilityLabel={name}
      style={[
        styles.base,
        { width: px, height: px, borderRadius: corner, backgroundColor: tint(base, 0.14) },
        style,
      ]}>
      {uri ? (
        <Image source={{ uri }} style={[StyleSheet.absoluteFill, { borderRadius: corner }]} resizeMode="cover" />
      ) : (
        <Text
          variant="caption"
          style={{ color: base, fontSize: FONT[size], lineHeight: FONT[size] * 1.25, fontWeight: typography.title3.fontWeight }}
          numberOfLines={1}>
          {initialsOf(name)}
        </Text>
      )}
    </View>
  );
}

/**
 * Square business/category tile used on GigCards and business dashboards.
 * Renders an icon glyph instead of initials when the caller has one.
 */
export function BusinessIcon({
  name,
  icon,
  uri,
  size = layout.gigIconSize,
  tone,
}: {
  name: string;
  icon?: React.ReactNode;
  uri?: string | null;
  size?: number;
  tone?: string;
}) {
  const base = tone ?? avatarTint(name || 'YC');
  return (
    <View
      accessibilityRole="image"
      accessibilityLabel={name}
      style={[styles.base, { width: size, height: size, borderRadius: radius.md, backgroundColor: tint(base, 0.12) }]}>
      {uri ? (
        <Image source={{ uri }} style={[StyleSheet.absoluteFill, { borderRadius: radius.md }]} resizeMode="cover" />
      ) : icon ? (
        icon
      ) : (
        <Text variant="label" style={{ color: base }}>
          {initialsOf(name)}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: color.borderSubtle,
  },
});

export default Avatar;
