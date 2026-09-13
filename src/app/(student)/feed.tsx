/**
 * Discover Gigs — wireframe 12/37. Rebuild in place, route unchanged.
 *
 * Route: /(student)/feed  ·  Spec: docs/wireframes/12-discover-gigs.md
 *
 * Data honesty:
 *  - Feed = real listGigs() OPEN gigs; every card goes through the shared
 *    toGigCardData mapper (identical GigCard everywhere).
 *  - The wireframe's "92% Skill Match" banner sits on a matchScore the API
 *    never exposes. Instead of faking it, the match % is COMPUTED CLIENT-SIDE
 *    from the real overlap between your saved StudentProfile.skills and each
 *    gig's skillsRequired — real data, real arithmetic, labelled as matching
 *    your profile. The feed sorts by it. No saved skills → no banner (flagged
 *    strip instead).
 *  - "Nearby Gigs / within 5km" has no geo backend → the section keeps the
 *    wireframe title but the caption states the real sorting, per the approved
 *    text-only pilot rule.
 *  - Quick chips reuse the screen-2 pattern: Budget ₹1k + Design are REAL
 *    server filters (maxBudget/skill params); Near me + Verified Only toggle
 *    an explanatory InfoBanner (no geo / no isVerified in the feed payload).
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import {
  Avatar,
  Banner,
  BottomTabBar,
  EmptyState,
  ErrorState,
  GigCard,
  Icon,
  InfoBanner,
  LoadingSkeleton,
  Screen,
  ScreenHeader,
  SectionHeader,
  SelectableChip,
  Text,
} from '@/components/ui';
import { apiErrorMessage } from '@/config/api';
import { listGigs } from '@/lib/gig-api';
import { toGigCardData } from '@/lib/gig-card-data';
import { getProfile } from '@/lib/profile-api';
import { goStudentTab } from '@/lib/tab-nav';
import { STUDENT_TABS } from '@/components/ui/BottomTabBar';
import { useAuth } from '@/providers/auth-provider';
import { color } from '@/theme/colors';
import { layout, space } from '@/theme/spacing';
import type { Gig } from '@/types/api';

const RADIUS_KEY = 'yuvaconnect:work-radius';
const LOC_KEY = 'yuvaconnect:location-availability';

/** Client-side skill-overlap match — the honest stand-in for matchScore. */
function matchScore(gig: Gig, skills: string[]) {
  if (!skills.length || !gig.skillsRequired?.length) return 0;
  const mine = new Set(skills.map((s) => s.toLowerCase()));
  const hit = gig.skillsRequired.filter((s) => mine.has(s.toLowerCase())).length;
  return Math.round((hit / gig.skillsRequired.length) * 100);
}

export default function DiscoverFeedScreen() {
  const { token, user } = useAuth();
  const [budget1k, setBudget1k] = useState(false);
  const [design, setDesign] = useState(false);
  const [nearMe, setNearMe] = useState(false);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [location, setLocation] = useState('');

  useEffect(() => {
    AsyncStorage.getItem(LOC_KEY)
      .then((raw) => raw && setLocation((JSON.parse(raw) as { location?: string }).location ?? ''))
      .catch(() => undefined);
    AsyncStorage.getItem(RADIUS_KEY).catch(() => undefined);
  }, []);

  const gigsQuery = useQuery({
    queryKey: ['gigs', 'open', { maxBudget: budget1k ? '1000' : undefined, skill: design ? 'Design' : undefined }],
    queryFn: () =>
      listGigs(token!, {
        ...(budget1k ? { maxBudget: '1000' } : {}),
        ...(design ? { skill: 'Design' } : {}),
      }),
    enabled: !!token,
  });

  const profileQuery = useQuery({
    queryKey: ['profile', token],
    queryFn: () => getProfile(token!),
    enabled: !!token,
  });
  const mySkills = useMemo(() => {
    const profile = profileQuery.data?.profile;
    return profile && 'skills' in profile ? (profile.skills ?? []) : [];
  }, [profileQuery.data]);

  const sorted = useMemo(() => {
    const gigs = gigsQuery.data ?? [];
    return [...gigs].sort((a, b) => matchScore(b, mySkills) - matchScore(a, mySkills));
  }, [gigsQuery.data, mySkills]);

  const bestMatch = sorted.length ? matchScore(sorted[0], mySkills) : 0;
  const topSkill = mySkills[0] ?? '';

  const toggleFlagChip = (which: 'near' | 'verified', on: boolean) => {
    if (which === 'near') setNearMe(on);
    else setVerifiedOnly(on);
    setNotice(
      on
        ? which === 'near'
          ? '“Near me” needs a geo backend, which does not exist yet — the feed keeps showing all open gigs. Flagged, not faked.'
          : 'Business verification is not exposed on the feed payload yet — the list stays unfiltered. Flagged, not faked.'
        : null,
    );
  };

  return (
    <Screen testID="screen-feed">
      <ScreenHeader
        title="Find your next opportunity"
        onBack={() => router.back()}
        trailing={<Avatar name={user?.name ?? 'Student'} size="md" />}
      />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* --- Location row: real device-local value from screen 10 --- */}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Set your location"
          onPress={() => router.push('/location' as never)}
          style={styles.locationRow}>
          <Icon name="mapPinFilled" size={14} color={color.success} />
          <Text variant="captionStrong" style={styles.locationText}>
            {location || 'Set your location'}
          </Text>
        </Pressable>

        {/* --- Search launcher (read-only strip) --- */}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Search gigs"
          onPress={() => router.push('/search' as never)}
          style={({ pressed }) => [styles.searchStrip, pressed && styles.pressed]}>
          <Icon name="search" size={18} color={color.textSecondary} />
          <Text variant="body" tone="secondary">
            Search by skill, company or location...
          </Text>
        </Pressable>

        {/* --- Quick chip rail (screen-2 patterns) --- */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.railRow}>
          <SelectableChip label="Near me" icon="locate" selected={nearMe} onToggle={() => toggleFlagChip('near', !nearMe)} />
          <SelectableChip label="Budget: ₹1k" icon="wallet" selected={budget1k} onToggle={() => setBudget1k(!budget1k)} />
          <SelectableChip label="Design" icon="palette" selected={design} onToggle={() => setDesign(!design)} />
          <SelectableChip
            label="Verified Only"
            icon="shieldCheckFilled"
            selected={verifiedOnly}
            onToggle={() => toggleFlagChip('verified', !verifiedOnly)}
          />
        </ScrollView>

        {notice ? <InfoBanner tone="info" icon="info" title="Flagged, not faked" description={notice} /> : null}

        {/* --- Skill-match banner: computed from real profile skills --- */}
        {mySkills.length ? (
          <Banner
            tone="brand"
            icon="sparkles"
            title={`${bestMatch}% Skill Match`}
            description={`Gigs matching your ${topSkill} profile — computed from your saved skills.`}
            onPress={() => router.push('/search' as never)}
          />
        ) : (
          <InfoBanner
            tone="info"
            icon="bulb"
            title="Add your skills to see match percentages"
            description="The match banner compares open gigs against your profile skills — set them on the Skill Selection screen."
            actionLabel="Choose skills"
            onAction={() => router.push('/skills' as never)}
          />
        )}

        {/* --- Feed --- */}
        <View style={styles.section}>
          <SectionHeader title="Nearby Gigs" />
          <Text variant="caption" tone="secondary" style={styles.sectionNote}>
            Sorted by skill match — distance sorting ships with geo support.
          </Text>

          {gigsQuery.isLoading ? (
            <LoadingSkeleton count={3} variant="card" />
          ) : gigsQuery.isError ? (
            <ErrorState title="Could not load gigs" description={apiErrorMessage(gigsQuery.error)} retryLabel="Retry" onRetry={() => gigsQuery.refetch()} />
          ) : sorted.length === 0 ? (
            <EmptyState
              title="No gigs match those filters"
              description="Try clearing the budget or skill chips — businesses post new micro-gigs every week."
              icon="searchEmpty"
            />
          ) : (
            sorted.map((gig) => (
              <GigCard
                key={gig.id}
                gig={toGigCardData(gig)}
                onPress={() => router.push(`/(student)/gig/${gig.id}` as never)}
                style={styles.card}
              />
            ))
          )}
        </View>
      </ScrollView>

      <BottomTabBar items={STUDENT_TABS} activeKey="discover" onSelect={goStudentTab} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: layout.screenGutter,
    paddingTop: space.sm,
    gap: space.base,
    maxWidth: layout.maxContentWidth,
    width: '100%',
    alignSelf: 'center',
    paddingBottom: space['2xl'],
  },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  locationText: { color: color.successStrong },

  searchStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    backgroundColor: color.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: color.borderSubtle,
    paddingHorizontal: space.base,
    paddingVertical: space.md,
  },
  pressed: { opacity: 0.8 },

  railRow: { gap: space.md, paddingRight: space.md },
  section: { gap: space.md },
  sectionNote: { marginTop: -space.sm },
  card: { marginBottom: space.md },
});
