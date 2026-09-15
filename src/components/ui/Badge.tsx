import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { color } from '@/theme/colors';
import { radius } from '@/theme/radius';
import { space } from '@/theme/spacing';
import type { IconName } from '@/theme/icons';
import { Icon } from './Icon';
import { Text } from './Text';

// ------------------------------------------------------------
// StatusBadge — coloured pill used for every trust/state signal.
// ------------------------------------------------------------

export type BadgeTone = 'brand' | 'success' | 'warning' | 'danger' | 'info' | 'accent' | 'neutral' | 'solid';

const TONES: Record<BadgeTone, { bg: string; fg: string; border: string }> = {
  brand: { bg: color.primarySoft, fg: color.primaryText, border: color.primaryBorder },
  success: { bg: color.successSoft, fg: color.successStrong, border: color.successBorder },
  warning: { bg: color.warningSoft, fg: color.warningStrong, border: color.warningBorder },
  danger: { bg: color.dangerSoft, fg: color.dangerStrong, border: color.dangerBorder },
  info: { bg: color.infoSoft, fg: color.info, border: color.infoBorder },
  accent: { bg: color.accentSoft, fg: color.accent, border: color.accentBorder },
  neutral: { bg: color.surfaceMuted, fg: color.textSecondary, border: color.border },
  solid: { bg: color.primary, fg: color.textInverse, border: color.primary },
};

export type StatusBadgeProps = {
  label: string;
  tone?: BadgeTone;
  icon?: IconName;
  /** Compact = smaller padding, used inline in dense rows. */
  size?: 'sm' | 'md';
  style?: StyleProp<ViewStyle>;
  testID?: string;
};

export function StatusBadge({ label, tone = 'neutral', icon, size = 'md', style, testID }: StatusBadgeProps) {
  const skin = TONES[tone];
  return (
    <View
      testID={testID}
      style={[
        styles.badge,
        size === 'sm' ? styles.badgeSm : styles.badgeMd,
        { backgroundColor: skin.bg, borderColor: skin.border },
        style,
      ]}>
      {icon ? <Icon name={icon} size={size === 'sm' ? 11 : 13} color={skin.fg} /> : null}
      <Text variant="caption" style={{ color: skin.fg, fontWeight: '700' }} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

// ------------------------------------------------------------
// VerifiedBadge — the blue checkmark next to a name.
// ------------------------------------------------------------

export function VerifiedBadge({
  size = 14,
  label,
  tone = 'brand',
  style,
}: {
  size?: number;
  /** When set, renders the full "Verified Student" / "Verified MSME" pill. */
  label?: string;
  tone?: 'brand' | 'success';
  style?: StyleProp<ViewStyle>;
}) {
  const fg = tone === 'success' ? color.success : color.primary;
  if (!label) {
    return (
      <View style={[styles.verifiedMark, style]} accessibilityLabel="Verified">
        <Icon name="verified" size={size} color={fg} />
      </View>
    );
  }
  return (
    <StatusBadge
      label={label}
      tone={tone === 'success' ? 'success' : 'brand'}
      icon="shieldCheckFilled"
      size="sm"
      style={style}
    />
  );
}

// ------------------------------------------------------------
// SkillPill — rounded chip with light tint + coloured text.
// Used for BOTH filtering (selectable) and display (static).
// ------------------------------------------------------------

export type SkillPillProps = {
  label: string;
  /** `brand` for skills, `neutral` for generic meta chips. */
  tone?: 'brand' | 'success' | 'neutral' | 'accent';
  icon?: IconName;
  size?: 'sm' | 'md';
  style?: StyleProp<ViewStyle>;
};

const PILL_TONES: Record<NonNullable<SkillPillProps['tone']>, { bg: string; fg: string }> = {
  brand: { bg: color.primarySoft, fg: color.primaryText },
  success: { bg: color.successSoft, fg: color.successStrong },
  neutral: { bg: color.surfaceMuted, fg: color.textSecondary },
  accent: { bg: color.accentSoft, fg: color.accent },
};

export function SkillPill({ label, tone = 'brand', icon, size = 'md', style }: SkillPillProps) {
  const skin = PILL_TONES[tone];
  return (
    <View
      style={[
        styles.pill,
        size === 'sm' ? styles.pillSm : styles.pillMd,
        { backgroundColor: skin.bg },
        style,
      ]}>
      {icon ? <Icon name={icon} size={size === 'sm' ? 11 : 13} color={skin.fg} /> : null}
      <Text variant="caption" style={{ color: skin.fg }} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

/**
 * Wrapping row of skill chips. Collapses overflow into "+N more" when
 * `max` is set, which is how the GigCard keeps a fixed height.
 */
export function SkillPillRow({
  skills,
  tone = 'brand',
  max,
  size = 'md',
  style,
}: {
  skills: string[];
  tone?: SkillPillProps['tone'];
  max?: number;
  size?: 'sm' | 'md';
  style?: StyleProp<ViewStyle>;
}) {
  if (!skills?.length) return null;
  const shown = max ? skills.slice(0, max) : skills;
  const overflow = max ? skills.length - shown.length : 0;
  return (
    <View style={[styles.pillRow, style]}>
      {shown.map((skill) => (
        <SkillPill key={skill} label={skill} tone={tone} size={size} />
      ))}
      {overflow > 0 ? <SkillPill label={`+${overflow} more`} tone="neutral" size={size} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.xs,
    borderRadius: radius.full,
    borderWidth: 1,
  },
  badgeSm: { paddingHorizontal: space.sm, paddingVertical: 3 },
  badgeMd: { paddingHorizontal: space.md, paddingVertical: 5 },

  verifiedMark: { marginLeft: space.xs, alignSelf: 'center' },

  pill: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.xs,
    borderRadius: radius.full,
  },
  pillSm: { paddingHorizontal: space.sm, paddingVertical: 3 },
  pillMd: { paddingHorizontal: 10, paddingVertical: 5 },

  pillRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
});

export default StatusBadge;
