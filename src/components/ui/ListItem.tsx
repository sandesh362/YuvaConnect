import React from 'react';
import { Pressable, StyleSheet, Switch, View, type StyleProp, type ViewStyle } from 'react-native';

import { color } from '@/theme/colors';
import { radius } from '@/theme/radius';
import { layout, space } from '@/theme/spacing';
import type { IconName } from '@/theme/icons';
import { Avatar } from './Avatar';
import { StatusBadge } from './Badge';
import { Divider } from './Card';
import { Icon } from './Icon';
import { RatingStars } from './RatingStars';
import { Text } from './Text';

// ------------------------------------------------------------
// ListItem — the settings/profile menu row
// ------------------------------------------------------------

export type ListItemProps = {
  title: string;
  subtitle?: string;
  icon?: IconName;
  /** Tints the icon well; `neutral` renders no well at all. */
  iconTone?: 'brand' | 'success' | 'warning' | 'danger' | 'neutral' | 'none';
  trailing?: 'chevron' | 'none';
  trailingText?: string;
  badge?: string;
  badgeTone?: 'brand' | 'success' | 'warning' | 'danger' | 'neutral';
  onPress?: () => void;
  disabled?: boolean;
  /** Removes the bottom hairline (last row in a group). */
  last?: boolean;
  style?: StyleProp<ViewStyle>;
  testID?: string;
};

const ICON_TONES: Record<Exclude<NonNullable<ListItemProps['iconTone']>, 'none'>, { bg: string; fg: string }> = {
  brand: { bg: color.primarySoft, fg: color.primary },
  success: { bg: color.successSoft, fg: color.success },
  warning: { bg: color.warningSoft, fg: color.warningStrong },
  danger: { bg: color.dangerSoft, fg: color.danger },
  neutral: { bg: color.surfaceMuted, fg: color.textSecondary },
};

/** Standard menu row: tinted icon well · title/subtitle · chevron. */
export function ListItem({
  title,
  subtitle,
  icon,
  iconTone = 'brand',
  trailing = 'chevron',
  trailingText,
  badge,
  badgeTone = 'brand',
  onPress,
  disabled = false,
  last = false,
  style,
  testID,
}: ListItemProps) {
  const tone = iconTone === 'none' ? undefined : ICON_TONES[iconTone];
  return (
    <Pressable
      testID={testID}
      accessibilityRole={onPress ? 'button' : 'text'}
      accessibilityLabel={title}
      accessibilityState={{ disabled }}
      disabled={disabled || !onPress}
      onPress={onPress}
      style={({ pressed }) => [
        styles.listItem,
        pressed && onPress ? { backgroundColor: color.surfaceMuted } : null,
        disabled && { opacity: 0.5 },
        !last && styles.listItemBorder,
        style,
      ]}>
      {icon && tone ? (
        <View style={[styles.iconWell, { backgroundColor: tone.bg }]}>
          <Icon name={icon} size={18} color={tone.fg} />
        </View>
      ) : null}
      <View style={styles.listItemBody}>
        <Text variant="calloutStrong" numberOfLines={1}>
          {title}
        </Text>
        {subtitle ? (
          <Text variant="caption" tone="secondary" numberOfLines={2} style={{ marginTop: 1 }}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {badge ? <StatusBadge label={badge} tone={badgeTone} size="sm" /> : null}
      {trailingText ? (
        <Text variant="caption" tone="secondary" numberOfLines={1}>
          {trailingText}
        </Text>
      ) : null}
      {trailing === 'chevron' && onPress ? <Icon name="chevronRight" size={18} color={color.textTertiary} /> : null}
    </Pressable>
  );
}

/** Row with a trailing Switch (notification preferences, availability). */
export function SwitchRow({
  title,
  subtitle,
  icon,
  iconTone = 'brand',
  value,
  onValueChange,
  last = false,
}: {
  title: string;
  subtitle?: string;
  icon?: IconName;
  iconTone?: ListItemProps['iconTone'];
  value: boolean;
  onValueChange: (value: boolean) => void;
  last?: boolean;
}) {
  const tone = iconTone === 'none' ? undefined : ICON_TONES[iconTone];
  return (
    <View style={[styles.listItem, !last && styles.listItemBorder]}>
      {icon && tone ? (
        <View style={[styles.iconWell, { backgroundColor: tone.bg }]}>
          <Icon name={icon} size={18} color={tone.fg} />
        </View>
      ) : null}
      <View style={styles.listItemBody}>
        <Text variant="calloutStrong" numberOfLines={1}>
          {title}
        </Text>
        {subtitle ? (
          <Text variant="caption" tone="secondary" numberOfLines={2} style={{ marginTop: 1 }}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      <Switch
        accessibilityLabel={title}
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: color.border, true: color.primary }}
        thumbColor={color.surface}
      />
    </View>
  );
}

/** Groups ListItems inside a single rounded card, per the profile wireframes. */
export function ListGroup({ children, style }: { children: React.ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[styles.listGroup, style]}>{children}</View>;
}

// ------------------------------------------------------------
// CandidateCard — applicant management / saved talent
// ------------------------------------------------------------

export type CandidateCardData = {
  id: string;
  name: string;
  photo?: string | null;
  college?: string;
  course?: string;
  skills?: string[];
  rating?: number;
  reviewCount?: number;
  completedGigs?: number;
  /** No backend equivalent yet — pass undefined to hide the chip. */
  matchPercentage?: number;
  /** No backend equivalent yet — pass undefined to hide. */
  distance?: string;
  availability?: string;
  isVerified?: boolean;
  statusLabel?: string;
  statusTone?: 'brand' | 'success' | 'warning' | 'danger' | 'neutral';
};

export type CandidateCardProps = {
  candidate: CandidateCardData;
  onPress?: () => void;
  onShortlist?: () => void;
  onMessage?: () => void;
  onSelect?: () => void;
  /** Hides the action row (Saved Talent, comparison view). */
  showActions?: boolean;
  /** Renders the radio/check used in Candidate Comparison. */
  selected?: boolean;
  onToggleSelect?: () => void;
  style?: StyleProp<ViewStyle>;
  testID?: string;
};

export function CandidateCard({
  candidate,
  onPress,
  onShortlist,
  onMessage,
  onSelect,
  showActions = true,
  selected,
  onToggleSelect,
  style,
  testID,
}: CandidateCardProps) {
  const selectable = onToggleSelect !== undefined;
  return (
    <Pressable
      testID={testID}
      accessibilityRole={selectable ? 'checkbox' : 'button'}
      accessibilityLabel={`${candidate.name}${candidate.college ? `, ${candidate.college}` : ''}`}
      accessibilityState={selectable ? { selected, checked: selected } : undefined}
      disabled={!onPress && !selectable}
      onPress={selectable ? onToggleSelect : onPress}
      style={({ pressed }) => [
        styles.card,
        selected && styles.cardSelected,
        pressed && (onPress || selectable) ? styles.pressed : null,
        style,
      ]}>
      <View style={styles.candidateRow}>
        <Avatar name={candidate.name} uri={candidate.photo} size="md" />
        <View style={styles.candidateIdentity}>
          <View style={styles.candidateNameRow}>
            <Text variant="heading" numberOfLines={1} style={styles.candidateName}>
              {candidate.name}
            </Text>
            {candidate.isVerified ? <Icon name="verified" size={14} color={color.primary} /> : null}
          </View>
          {candidate.college ? (
            <Text variant="caption" tone="secondary" numberOfLines={1}>
              {[candidate.course, candidate.college].filter(Boolean).join(' · ')}
            </Text>
          ) : null}
        </View>
        {selectable ? (
          <View style={[styles.radio, selected && styles.radioOn]}>
            {selected ? <Icon name="check" size={13} color={color.textInverse} /> : null}
          </View>
        ) : candidate.statusLabel ? (
          <StatusBadge label={candidate.statusLabel} tone={candidate.statusTone ?? 'neutral'} size="sm" />
        ) : null}
      </View>

      <View style={styles.candidateMeta}>
        {candidate.matchPercentage ? (
          <StatusBadge label={`${candidate.matchPercentage}% Match`} tone="success" icon="flashFilled" size="sm" />
        ) : null}
        {candidate.rating ? <RatingStars value={candidate.rating} count={candidate.reviewCount} size={12} /> : null}
        {candidate.completedGigs !== undefined ? (
          <View style={styles.metaItem}>
            <Icon name="briefcase" size={12} color={color.textSecondary} />
            <Text variant="caption" tone="secondary">
              {candidate.completedGigs} gigs
            </Text>
          </View>
        ) : null}
        {candidate.distance ? (
          <View style={styles.metaItem}>
            <Icon name="mapPin" size={12} color={color.textSecondary} />
            <Text variant="caption" tone="secondary">
              {candidate.distance}
            </Text>
          </View>
        ) : null}
      </View>

      {candidate.skills && candidate.skills.length > 0 ? (
        <View style={styles.candidateSkills}>
          {candidate.skills.slice(0, 3).map((skill) => (
            <View key={skill} style={styles.miniPill}>
              <Text variant="caption" tone="brand">
                {skill}
              </Text>
            </View>
          ))}
        </View>
      ) : null}

      {showActions && (onShortlist || onMessage || onSelect) ? (
        <>
          <Divider style={styles.candidateDivider} />
          <View style={styles.candidateActions}>
            {onShortlist ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Shortlist ${candidate.name}`}
                onPress={onShortlist}
                style={({ pressed }) => [styles.actionOutline, pressed && { backgroundColor: color.surfaceMuted }]}>
                <Icon name="bookmark" size={14} color={color.textSecondary} />
                <Text variant="caption" tone="secondary" style={{ fontWeight: '700' }}>
                  Shortlist
                </Text>
              </Pressable>
            ) : null}
            {onMessage ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Message ${candidate.name}`}
                onPress={onMessage}
                style={({ pressed }) => [styles.actionGhost, pressed && { opacity: 0.6 }]}>
                <Icon name="chat" size={14} color={color.textSecondary} />
                <Text variant="caption" tone="secondary" style={{ fontWeight: '700' }}>
                  Message
                </Text>
              </Pressable>
            ) : null}
            {onSelect ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Select ${candidate.name}`}
                onPress={onSelect}
                style={({ pressed }) => [styles.actionPrimary, pressed && { backgroundColor: color.primaryPressed }]}>
                <Text variant="caption" style={{ color: color.textInverse, fontWeight: '700' }}>
                  Select
                </Text>
              </Pressable>
            ) : null}
          </View>
        </>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    paddingVertical: space.md,
    paddingHorizontal: layout.cardPadding,
    minHeight: 56,
  },
  listItemBorder: { borderBottomWidth: 1, borderBottomColor: color.divider },
  listItemBody: { flex: 1, justifyContent: 'center' },
  iconWell: {
    width: 34,
    height: 34,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listGroup: {
    backgroundColor: color.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: color.borderSubtle,
    overflow: 'hidden',
    marginBottom: space.md,
  },

  card: {
    backgroundColor: color.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: color.borderSubtle,
    padding: layout.cardPadding,
    marginBottom: space.md,
  },
  cardSelected: { borderColor: color.primary, borderWidth: 1.5, backgroundColor: color.primarySoft },
  pressed: { opacity: 0.9 },

  candidateRow: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  candidateIdentity: { flex: 1, gap: 2 },
  candidateNameRow: { flexDirection: 'row', alignItems: 'center', gap: space.xs },
  candidateName: { flexShrink: 1 },
  radio: {
    width: 22,
    height: 22,
    borderRadius: radius.full,
    borderWidth: 2,
    borderColor: color.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOn: { backgroundColor: color.primary, borderColor: color.primary },

  candidateMeta: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: space.md, marginTop: space.md },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: space.xs },
  candidateSkills: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: space.md },
  miniPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.full,
    backgroundColor: color.primarySoft,
  },
  candidateDivider: { marginVertical: space.md },
  candidateActions: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: space.sm },
  actionOutline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: space.md,
    paddingVertical: 8,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: color.border,
  },
  actionGhost: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: space.sm, paddingVertical: 8 },
  actionPrimary: {
    paddingHorizontal: space.base,
    paddingVertical: 8,
    borderRadius: radius.md,
    backgroundColor: color.primary,
  },
});

export default ListItem;
