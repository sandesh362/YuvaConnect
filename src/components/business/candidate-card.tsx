/**
 * Shared candidate card — wireframes 29/31. One source for the applicant card
 * (initials circle, name, college, derived match pill, rating, gig count,
 * Shortlist / Message / Select action row) so Manage Applicants and Candidate
 * Comparison never drift, exactly like the GigCard rule.
 *
 * Data honesty (see screen 29 header for the full flag list): match % is a
 * DERIVED skills-overlap figure; Shortlist raises the no-endpoint notice;
 * Select stays a quiet no-op until Confirm Selection (screen 32) ships.
 */
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { router } from 'expo-router';

import { Button, Icon, Text } from '@/components/ui';
import { color } from '@/theme/colors';
import { radius } from '@/theme/radius';
import { layout, space } from '@/theme/spacing';
import type { Application } from '@/types/api';

export type ApplicantStudent = {
  id: string;
  name: string;
  email: string;
  studentProfile?: { college: string; skills: string[]; bio: string; profileImageUrl: string | null; avgRating: number; totalRatings: number } | null;
};

export type Applicant = Application & {
  student: ApplicantStudent;
  avgRating: number;
  totalRatings: number;
  pastGigCount: number;
};

export function matchPercent(applicant: Applicant, skillsRequired: string[]): number | null {
  const skills = applicant.student.studentProfile?.skills ?? [];
  if (skillsRequired.length === 0 || skills.length === 0) return null;
  const wanted = skillsRequired.map((skill) => skill.toLowerCase());
  const hits = wanted.filter((skill) =>
    skills.some((have) => have.toLowerCase() === skill || have.toLowerCase().includes(skill) || skill.includes(have.toLowerCase())),
  );
  return Math.round((hits.length / wanted.length) * 100);
}

export function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.trim().slice(0, 2).toUpperCase();
}

export function CandidateCard({
  applicant,
  match,
  gigId,
  onShortlist,
  onOpenProfile,
  onSelect,
  style,
}: {
  applicant: Applicant;
  match: number | null;
  gigId: string;
  /** Raises the "no live shortlist endpoint" notice — owned by the screen. */
  onShortlist: () => void;
  onOpenProfile: () => void;
  /** Deep-links Confirm Selection (/assign/[applicationId]?gigId=). */
  onSelect: () => void;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View style={[styles.candidateCard, style]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`View profile of ${applicant.student.name}`}
        onPress={onOpenProfile}
        style={({ pressed }) => [styles.candidateTop, pressed && styles.pressed]}
        testID={`candidate-${applicant.id}`}>
        <View style={styles.initialsCircle} accessibilityLabel={applicant.student.name}>
          <Text variant="title3" style={styles.initialsText}>
            {initialsOf(applicant.student.name)}
          </Text>
        </View>
        <View style={styles.candidateIdentity}>
          <Text variant="title3" numberOfLines={1}>
            {applicant.student.name}
          </Text>
          <Text variant="caption" tone="tertiary" numberOfLines={1}>
            {applicant.student.studentProfile?.college || 'College not listed'}
          </Text>
        </View>
      </Pressable>

      <View style={styles.statRow}>
        {match !== null ? (
          <View style={styles.matchPill} accessibilityLabel={`${match} percent match, derived from skills overlap`}>
            <Icon name="flashFilled" size={12} color={color.successStrong} />
            <Text variant="captionStrong" style={styles.matchLabel}>
              {`${match}% Match`}
            </Text>
          </View>
        ) : null}
        <View style={styles.statItem}>
          <Icon name="starFilled" size={14} color={color.warningStrong} />
          <Text variant="captionStrong">{applicant.avgRating.toFixed(1)}</Text>
        </View>
        <View style={styles.statItem}>
          <Icon name="briefcase" size={14} color={color.textTertiary} />
          <Text variant="caption" tone="tertiary">
            {`${applicant.pastGigCount} Gigs`}
          </Text>
        </View>
      </View>

      <View style={styles.cardDivider} />

      <View style={styles.actionRow}>
        <Button
          label={applicant.status === 'SHORTLISTED' ? 'Shortlisted' : 'Shortlist'}
          variant="secondary"
          size="sm"
          style={styles.actionBtn}
          onPress={onShortlist}
          testID={`shortlist-${applicant.id}`}
        />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Message on the gig thread"
          onPress={() => router.push(`/(shared)/chat/${gigId}` as never)}
          style={({ pressed }) => [styles.messageBtn, pressed && styles.pressed]}
          testID={`message-${applicant.id}`}>
          <Icon name="chat" size={16} color={color.primary} />
          <Text variant="callout" style={styles.messageLabel}>
            Message
          </Text>
        </Pressable>
        <Button
          label={applicant.status === 'SELECTED' ? 'Selected' : 'Select'}
          size="sm"
          style={styles.actionBtn}
          onPress={onSelect}
          testID={`select-${applicant.id}`}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  candidateCard: {
    backgroundColor: color.surface,
    borderWidth: 1,
    borderColor: color.border,
    borderRadius: radius.lg,
    padding: space.base,
    gap: space.md,
  },
  candidateTop: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  initialsCircle: {
    width: 56,
    height: 56,
    borderRadius: radius.full,
    backgroundColor: color.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initialsText: { color: color.primary },
  candidateIdentity: { flex: 1, gap: 2 },

  statRow: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  matchPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: color.successSoft,
    borderRadius: radius.full,
    paddingHorizontal: space.sm,
    paddingVertical: 4,
  },
  matchLabel: { color: color.successStrong },
  statItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },

  cardDivider: { height: 1, backgroundColor: color.divider },

  actionRow: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  actionBtn: { flex: 1 },
  messageBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: space.xs, flex: 1, minHeight: layout.tapTarget, paddingVertical: space.sm },
  messageLabel: { color: color.primary, fontWeight: '600' },
  pressed: { opacity: 0.7 },
});
