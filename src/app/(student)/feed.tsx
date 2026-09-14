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
  Divider,
  EmptyState,
  ErrorState,
  GigCard,
  Icon,
  InfoBanner,
  LoadingSkeleton,
  PrimaryButton,
  RadioRow,
  Screen,
  ScreenHeader,
  SectionHeader,
  SelectableChip,
  Sheet,
  Slider,
  Text,
  TextField,
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

/** Filter-sheet skill list — the six the wireframe draws, plus two common extras. */
const FILTER_SKILLS = ['Graphic Design', 'Social Media', 'Content Writing', 'Photography', 'Data Entry', 'Video Editing', 'Web Development', 'Python'];

const DURATIONS = ['Single Day', '1-3 Days', '1 Week', '1 Month+'];

type BudgetPreset = 'under1k' | 'mid' | 'over5k' | null;

type FilterDraft = {
  skills: string[];
  min: string;
  max: string;
  preset: BudgetPreset;
  duration: string | null;
  distanceKm: number;
};

const EMPTY_DRAFT: FilterDraft = { skills: [], min: '', max: '', preset: null, duration: null, distanceKm: 15 };

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
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [draft, setDraft] = useState<FilterDraft>(EMPTY_DRAFT);
  const [applied, setApplied] = useState<FilterDraft>(EMPTY_DRAFT);

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

  const draftMatches = (gig: Gig, filters: FilterDraft) => {
    if (filters.skills.length) {
      const wanted = new Set(filters.skills.map((skill) => skill.toLowerCase()));
      if (!gig.skillsRequired?.some((skill) => wanted.has(skill.toLowerCase()))) return false;
    }
    const min = filters.min.trim() ? Number(filters.min) : null;
    const max = filters.max.trim() ? Number(filters.max) : null;
    const budget = Number(gig.budget);
    if (min !== null && budget < min) return false;
    if (max !== null && budget > max) return false;
    return true;
  };

  const draftCount = useMemo(() => sorted.filter((gig) => draftMatches(gig, draft)).length, [sorted, draft]);
  const filtered = useMemo(() => sorted.filter((gig) => draftMatches(gig, applied)), [sorted, applied]);
  const filtersActive =
    applied.skills.length > 0 || !!applied.min.trim() || !!applied.max.trim() || !!applied.duration;

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

  const setPreset = (preset: BudgetPreset) =>
    setDraft((current) => {
      const base = { ...current, preset };
      if (preset === 'under1k') return { ...base, min: '0', max: '999' };
      if (preset === 'mid') return { ...base, min: '1000', max: '5000' };
      if (preset === 'over5k') return { ...base, min: '5001', max: '' };
      return { ...base, min: '', max: '' };
    });

  const applyFilters = () => {
    setApplied(draft);
    setFiltersOpen(false);
    if (draft.duration) {
      setNotice(`Duration “${draft.duration}” is flagged, not faked: the Gig model has no duration field, so it is shown but cannot filter the feed yet.`);
    } else if (draft.distanceKm !== 15) {
      setNotice('Distance radius is flagged, not faked: no geo backend exists, so the slider is displayed but does not filter.');
    } else {
      setNotice(null);
    }
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
          <SectionHeader title="Nearby Gigs" actionLabel="Filters" onAction={() => setFiltersOpen(true)} />
          <Text variant="caption" tone="secondary" style={styles.sectionNote}>
            Sorted by skill match — distance sorting ships with geo support.
          </Text>

          {gigsQuery.isLoading ? (
            <LoadingSkeleton count={3} variant="card" />
          ) : gigsQuery.isError ? (
            <ErrorState title="Could not load gigs" description={apiErrorMessage(gigsQuery.error)} retryLabel="Retry" onRetry={() => gigsQuery.refetch()} />
          ) : filtered.length === 0 ? (
            <EmptyState
              title="No gigs match those filters"
              description={filtersActive ? 'Loosen the Filters sheet (skills / budget) or clear the quick chips.' : 'Try clearing the budget or skill chips — businesses post new micro-gigs every week.'}
              icon="searchEmpty"
              {...(filtersActive ? { primaryLabel: 'Reset filters', onPrimary: () => { setApplied(EMPTY_DRAFT); setDraft(EMPTY_DRAFT); setNotice(null); } } : {})}
            />
          ) : (
            filtered.map((gig) => (
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

      {/* --- Gig Filters sheet (wireframe 13, decision 4: modal, no route) --- */}
      <Sheet
        visible={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        title="Filters"
        rightAction={{ label: 'Reset', onPress: () => setDraft(EMPTY_DRAFT) }}
        footer={
          <PrimaryButton
            label={`Show ${draftCount} Gigs`}
            onPress={applyFilters}
            testID="filters-apply"
          />
        }
        testID="sheet-filters">
        <View style={styles.filterHead}>
          <Text variant="title2">Distance Radius</Text>
          <Text variant="calloutStrong" tone="brand">
            Within {draft.distanceKm} km
          </Text>
        </View>
        <Text variant="bodyStrong">Distance</Text>
        <Slider
          value={draft.distanceKm}
          min={1}
          max={30}
          step={1}
          onValueChange={(value) => setDraft((current) => ({ ...current, distanceKm: value }))}
        />
        <Text variant="caption" tone="secondary">
          Showing gigs near {location || 'your saved location'} — distance has no geo backend yet, so the slider is display-only (flagged).
        </Text>

        <Divider />

        <Text variant="title2">Skills</Text>
        <Text variant="callout" tone="secondary">
          Select skills you want to use
        </Text>
        <View style={styles.chipWrap}>
          {FILTER_SKILLS.map((skill) => (
            <SelectableChip
              key={skill}
              label={skill}
              selected={draft.skills.includes(skill)}
              onToggle={() =>
                setDraft((current) => ({
                  ...current,
                  skills: current.skills.includes(skill) ? current.skills.filter((item) => item !== skill) : [...current.skills, skill],
                }))
              }
            />
          ))}
        </View>

        <Divider />

        <Text variant="title2">Budget Range (₹)</Text>
        <View style={styles.budgetRow}>
          <TextField
            label="Min"
            icon="wallet"
            type="number"
            keyboardType="number-pad"
            value={draft.min}
            onChangeText={(value) => setDraft((current) => ({ ...current, min: value, preset: null }))}
            placeholder="500"
            style={styles.budgetField}
          />
          <TextField
            label="Max"
            icon="wallet"
            type="number"
            keyboardType="number-pad"
            value={draft.max}
            onChangeText={(value) => setDraft((current) => ({ ...current, max: value, preset: null }))}
            placeholder="5000"
            style={styles.budgetField}
          />
        </View>
        <View style={styles.chipWrap}>
          <SelectableChip label="Under ₹1k" selectedStyle="soft" selected={draft.preset === 'under1k'} onToggle={() => setPreset(draft.preset === 'under1k' ? null : 'under1k')} />
          <SelectableChip label="₹1k - ₹5k" selectedStyle="soft" selected={draft.preset === 'mid'} onToggle={() => setPreset(draft.preset === 'mid' ? null : 'mid')} />
          <SelectableChip label="₹5k+" selectedStyle="soft" selected={draft.preset === 'over5k'} onToggle={() => setPreset(draft.preset === 'over5k' ? null : 'over5k')} />
        </View>

        <Divider />

        <Text variant="title2">Gig Duration</Text>
        <View>
          {DURATIONS.map((option) => (
            <RadioRow
              key={option}
              label={option}
              selected={draft.duration === option}
              onPress={() => setDraft((current) => ({ ...current, duration: current.duration === option ? null : option }))}
            />
          ))}
        </View>
        <Text variant="caption" tone="tertiary">
          Duration is flagged: the live Gig model has no duration column, so the selection is recorded but cannot filter yet.
        </Text>
      </Sheet>

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
  filterHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: space.md },
  budgetRow: { flexDirection: 'row', gap: space.md },
  budgetField: { flex: 1 },
  section: { gap: space.md },
  sectionNote: { marginTop: -space.sm },
  card: { marginBottom: space.md },
});
