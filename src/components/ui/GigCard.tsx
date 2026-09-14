import React from 'react';
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { color } from '@/theme/colors';
import { radius, shadow } from '@/theme/radius';
import { layout, space } from '@/theme/spacing';
import { BusinessIcon } from './Avatar';
import { SkillPillRow, StatusBadge, VerifiedBadge } from './Badge';
import { Divider } from './Card';
import { Icon } from './Icon';
import { Text } from './Text';

/**
 * Presentation model for a gig card. Deliberately NOT the API shape — screens
 * map their data (live API or mock) into this once, so the card renders
 * identically on Home, Discover, Saved, My Applications and Business lists.
 *
 * Fields the live Prisma API does not provide yet (`duration`, `distance`,
 * `matchPercentage`, `isSaved`) are optional and the card degrades cleanly.
 */
export type GigCardData = {
  id: string;
  title: string;
  businessName: string;
  businessPhoto?: string | null;
  isBusinessVerified?: boolean;
  skills?: string[];
  budget: number;
  /** Free text, e.g. "3 days". No API field yet. */
  duration?: string;
  /** Free text, e.g. "2.1 km". No API field yet. */
  distance?: string;
  location?: string;
  deadline?: string;
  statusLabel?: string;
  statusTone?: 'brand' | 'success' | 'warning' | 'danger' | 'neutral';
  applicantCount?: number;
  /** 0-100. Backend `matchScore()` exists but is not exposed on any route. */
  matchPercentage?: number;
  workType?: 'on-site' | 'remote' | 'both';
};

export type GigCardProps = {
  gig: GigCardData;
  onPress?: () => void;
  /** Bookmark toggle. Omit `onBookmark` to hide the control entirely. */
  onBookmark?: () => void;
  isBookmarked?: boolean;
  /** Hide the bookmark even when `onBookmark` is supplied (list contexts). */
  showBookmark?: boolean;
  /** Label for the trailing link. "View Gig" on student screens. */
  actionLabel?: string;
  /** Replaces the trailing link with a status pill (My Applications). */
  trailing?: React.ReactNode;
  maxSkills?: number;
  /** Dense variant drops the divider/footer for tight lists. */
  compact?: boolean;
  style?: StyleProp<ViewStyle>;
  testID?: string;
};

const WORK_TYPE_ICON = { 'on-site': 'mapPin', remote: 'desktop', both: 'globe' } as const;

/**
 * The canonical gig card.
 *
 *   ┌──────────────────────────────────────────────┐
 *   │ [■] Sharma Kirana ✓                        ⌄ │  ← square icon + name + verified
 *   │     Create Instagram Content Pack              ← bold title
 *   │     (Graphic Design) (+2 more)                 ← skill pills
 *   │ ─────────────────────────────────────────────  ← divider
 *   │ ₹2,500 • 3 days        2.1 km   View Gig ›     ← price/duration | distance/link
 *   └──────────────────────────────────────────────┘
 */
export function GigCard({
  gig,
  onPress,
  onBookmark,
  isBookmarked = false,
  showBookmark = true,
  actionLabel = 'View Gig',
  trailing,
  maxSkills = 2,
  compact = false,
  style,
  testID,
}: GigCardProps) {
  const bookmarkable = showBookmark && !!onBookmark;

  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={`${gig.title} by ${gig.businessName}, budget ${gig.budget} rupees`}
      disabled={!onPress}
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && onPress ? styles.pressed : null, style]}>
      {/* --- Top row: business identity + bookmark --- */}
      <View style={styles.topRow}>
        <BusinessIcon name={gig.businessName} uri={gig.businessPhoto} size={layout.gigIconSize} />
        <View style={styles.identity}>
          <View style={styles.nameRow}>
            <Text variant="caption" tone="secondary" numberOfLines={1} style={styles.name}>
              {gig.businessName}
            </Text>
            {gig.isBusinessVerified ? <VerifiedBadge size={13} /> : null}
          </View>
          <Text variant="title3" numberOfLines={2} style={styles.title}>
            {gig.title}
          </Text>
        </View>
        {bookmarkable ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={isBookmarked ? 'Remove from saved gigs' : 'Save gig'}
            accessibilityState={{ selected: isBookmarked }}
            hitSlop={8}
            onPress={onBookmark}
            style={({ pressed }) => [styles.bookmark, pressed && { opacity: 0.55 }]}>
            <Icon
              name={isBookmarked ? 'bookmarkFilled' : 'bookmark'}
              size={19}
              color={isBookmarked ? color.primary : color.textTertiary}
            />
          </Pressable>
        ) : null}
      </View>

      {/* --- Skill pills --- */}
      {gig.skills && gig.skills.length > 0 ? (
        <SkillPillRow skills={gig.skills} max={compact ? 1 : maxSkills} size="sm" style={styles.skills} />
      ) : null}

      {compact ? null : (
        <>
          <Divider style={styles.divider} />

          {/* --- Footer: price + duration  |  distance + action --- */}
          <View style={styles.footer}>
            <View style={styles.footerLeft}>
              <Text variant="price">₹{gig.budget.toLocaleString('en-IN')}</Text>
              {gig.duration ? (
                <MetaItem icon="clock" label={gig.duration} separator />
              ) : gig.deadline ? (
                <MetaItem icon="calendar" label={`Due ${gig.deadline}`} separator />
              ) : null}
            </View>

            {trailing ?? (
              <View style={styles.footerRight}>
                {gig.distance ? <MetaItem icon="mapPin" label={gig.distance} /> : null}
                {onPress ? (
                  <View style={styles.action}>
                    <Text variant="label" tone="brand">
                      {actionLabel}
                    </Text>
                    <Icon name="chevronRight" size={14} color={color.primary} />
                  </View>
                ) : null}
              </View>
            )}
          </View>
        </>
      )}
    </Pressable>
  );
}

/** Icon + text metadata pair used inside card footers. */
export function MetaItem({
  icon,
  label,
  separator = false,
  tone = 'secondary',
}: {
  icon: Parameters<typeof Icon>[0]['name'];
  label: string;
  separator?: boolean;
  tone?: 'secondary' | 'tertiary' | 'brand';
}) {
  const fg = tone === 'brand' ? color.primary : tone === 'tertiary' ? color.textTertiary : color.textSecondary;
  return (
    <View style={styles.meta}>
      {separator ? <Text variant="caption" tone="tertiary">•</Text> : null}
      <Icon name={icon} size={12} color={fg} />
      <Text variant="caption" style={{ color: fg }} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

/**
 * Optional trust/match strip that sits above a GigCard (or inside a detail
 * header). Renders nothing when there is no signal to show, so the same card
 * works whether or not the backend supplies a match score.
 */
export function GigCardFlags({
  matchPercentage,
  isVerified,
  verifiedLabel = 'Verified MSME',
  workType,
  applicantCount,
}: {
  matchPercentage?: number;
  isVerified?: boolean;
  verifiedLabel?: string;
  workType?: GigCardData['workType'];
  applicantCount?: number;
}) {
  const hasAny = matchPercentage || isVerified || workType || applicantCount;
  if (!hasAny) return null;
  return (
    <View style={styles.flags}>
      {matchPercentage ? <StatusBadge label={`${matchPercentage}% Skill Match`} tone="success" icon="flashFilled" size="sm" /> : null}
      {isVerified ? <VerifiedBadge label={verifiedLabel} /> : null}
      {workType ? (
        <StatusBadge
          label={workType === 'on-site' ? 'On-site' : workType === 'remote' ? 'Remote' : 'Hybrid'}
          tone="neutral"
          icon={WORK_TYPE_ICON[workType]}
          size="sm"
        />
      ) : null}
      {applicantCount ? (
        <StatusBadge label={`${applicantCount} applicant${applicantCount === 1 ? '' : 's'}`} tone="neutral" icon="people" size="sm" />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: color.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: color.borderSubtle,
    padding: layout.cardPadding,
    marginBottom: space.md,
    ...shadow.sm,
  },
  pressed: { opacity: 0.9, transform: [{ scale: 0.995 }] },

  topRow: { flexDirection: 'row', alignItems: 'flex-start', gap: space.md },
  identity: { flex: 1, gap: 3 },
  nameRow: { flexDirection: 'row', alignItems: 'center' },
  name: { flexShrink: 1 },
  title: { marginTop: 1 },
  bookmark: { padding: space.xs, marginLeft: space.xs },

  skills: { marginTop: space.md },

  divider: { marginVertical: space.md },

  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: space.sm },
  footerLeft: { flexDirection: 'row', alignItems: 'center', flexShrink: 1 },
  footerRight: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  meta: { flexDirection: 'row', alignItems: 'center', gap: space.xs },
  action: { flexDirection: 'row', alignItems: 'center', gap: 1 },

  flags: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm, marginBottom: space.md },
});

export default GigCard;
