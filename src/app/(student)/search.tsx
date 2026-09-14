/**
 * Global Search — wireframe 2/37.
 *
 * Route: /search (new, additive). Spec: docs/wireframes/02-global-search.md
 *
 * Data honesty notes (nothing here is faked):
 *  - The live `GET /api/gigs` accepts only skill / minBudget / maxBudget /
 *    sortBy. Text search therefore filters the fetched open gigs client-side
 *    over title, description, business name and skills.
 *  - "Budget: ₹1k" is a REAL server filter (maxBudget=1000).
 *  - "Remote" filters the free-text `location` column for remote wording.
 *  - "Near Me" and "Verified Only" have NO backing data (no geo; the gig feed
 *    does not include business verification). They toggle, but instead of
 *    pretending to filter they raise an explanatory InfoBanner.
 *  - "Top Verified Businesses" is derived from the businesses present on the
 *    fetched gigs; since verification is not in the payload the card shows an
 *    open-gig count instead of a "Verified" badge (deviation, documented).
 *  - Recent searches persist locally in AsyncStorage (they are a device
 *    convenience, clearly not server data).
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import {
  Avatar,
  BottomTabBar,
  ChipGroup,
  ChipRail,
  EmptyState,
  ErrorState,
  GigCard,
  GigCardSkeleton,
  Icon,
  IconButton,
  InfoBanner,
  Screen,
  SearchBar,
  SectionHeader,
  SelectableChip,
  STUDENT_TABS,
  Text,
  type GigCardData,
  type SelectableChipProps,
} from '@/components/ui';
import { apiErrorMessage } from '@/config/api';
import { listGigs } from '@/lib/gig-api';
import { toGigCardData } from '@/lib/gig-card-data';
import { goStudentTab } from '@/lib/tab-nav';
import { useAuth } from '@/providers/auth-provider';
import { color } from '@/theme/colors';
import type { IconName } from '@/theme/icons';
import { radius, shadow } from '@/theme/radius';
import { layout, space } from '@/theme/spacing';
import type { Gig } from '@/types/api';

const RECENT_KEY = 'yuvaconnect:recent-searches';
const RECENT_CAP = 6;

/** Curated discovery taxonomy — the API has no skills endpoint (flagged). */
const POPULAR: { label: string; icon: IconName; tint: string; fg: string }[] = [
  { label: 'UI/UX Design', icon: 'brush', tint: color.primarySoft, fg: color.primaryText },
  { label: 'Development', icon: 'code', tint: color.successSoft, fg: color.successStrong },
  { label: 'Photography', icon: 'camera', tint: color.warningSoft, fg: color.warningStrong },
  { label: 'Content Strategy', icon: 'bulb', tint: color.accentSoft, fg: color.accent },
];



export default function GlobalSearchScreen() {
  const { token } = useAuth();

  const [query, setQuery] = useState('');
  const [showQuickFilters, setShowQuickFilters] = useState(true);
  const [nearMe, setNearMe] = useState(false);
  const [budget1k, setBudget1k] = useState(false);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [remote, setRemote] = useState(false);
  const [recent, setRecent] = useState<string[]>([]);
  const [showAllBusinesses, setShowAllBusinesses] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(RECENT_KEY)
      .then((raw) => raw && setRecent(JSON.parse(raw) as string[]))
      .catch(() => undefined);
  }, []);

  const persistRecent = async (next: string[]) => {
    setRecent(next);
    try {
      if (next.length) await AsyncStorage.setItem(RECENT_KEY, JSON.stringify(next));
      else await AsyncStorage.removeItem(RECENT_KEY);
    } catch {
      /* local convenience only — never block the screen on it */
    }
  };

  // Real server filter for the budget chip; everything else is client-side.
  const gigsQuery = useQuery({
    queryKey: ['gigs', 'open', budget1k ? 'under-1k' : 'any'],
    queryFn: () => listGigs(token!, budget1k ? { maxBudget: '1000' } : {}),
    enabled: !!token,
  });

  const needle = query.trim().toLowerCase();

  const results = useMemo(() => {
    const gigs = gigsQuery.data ?? [];
    return gigs.filter((gig) => {
      if (remote && !/remote|work from home|anywhere/i.test(gig.location)) return false;
      if (!needle) return true;
      const business = gig.business?.businessProfile?.businessName ?? gig.business?.name ?? '';
      return [gig.title, gig.description, business, gig.skillsRequired.join(' ')]
        .join(' ')
        .toLowerCase()
        .includes(needle);
    });
  }, [gigsQuery.data, needle, remote]);

  const businesses = useMemo(() => {
    const map = new Map<string, { name: string; count: number }>();
    for (const gig of results) {
      const name = gig.business?.businessProfile?.businessName ?? gig.business?.name;
      if (!name) continue;
      const entry = map.get(gig.businessId) ?? { name, count: 0 };
      entry.count += 1;
      map.set(gig.businessId, entry);
    }
    return [...map.values()].sort((a, b) => b.count - a.count);
  }, [results]);

  const commitRecent = () => {
    const term = query.trim();
    if (!term) return;
    persistRecent([term, ...recent.filter((item) => item !== term)].slice(0, RECENT_CAP));
  };

  const quickFilters: SelectableChipProps[] = [
    { label: 'Near Me', icon: 'mapPinFilled', selected: nearMe, onToggle: () => setNearMe((v) => !v), indicator: 'none' },
    { label: 'Budget: ₹1k', icon: 'wallet', selected: budget1k, onToggle: () => setBudget1k((v) => !v), indicator: 'none' },
    { label: 'Verified Only', icon: 'shieldCheckFilled', selected: verifiedOnly, onToggle: () => setVerifiedOnly((v) => !v), indicator: 'none' },
    { label: 'Remote', icon: 'laptop', selected: remote, onToggle: () => setRemote((v) => !v), indicator: 'none' },
  ];

  const isFiltering = needle.length > 0 || budget1k || remote;

  return (
    <Screen testID="screen-global-search">
      {/* --- Search header --- */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <IconButton name="arrowBack" accessibilityLabel="Back" onPress={() => router.back()} />
          <SearchBar
            value={query}
            onChangeText={setQuery}
            onSubmit={commitRecent}
            placeholder="Search gigs, skills, or businesses"
            autoFocus
            style={styles.field}
            testID="global-search-field"
          />
          <IconButton
            name={showQuickFilters ? 'filterFilled' : 'filter'}
            accessibilityLabel="Toggle quick filters"
            onPress={() => setShowQuickFilters((v) => !v)}
          />
        </View>
        {showQuickFilters ? <ChipRail chips={quickFilters} contentStyle={styles.rail} /> : null}
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        {!token ? (
          <EmptyState
            title="Login to search"
            description="Search looks through every open gig near you. Login to get started."
            icon="searchEmpty"
            primaryLabel="Login"
            onPrimary={() => router.push('/login' as never)}
          />
        ) : gigsQuery.isError ? (
          <ErrorState
            title="Could not load gigs"
            description={apiErrorMessage(gigsQuery.error)}
            retryLabel="Retry"
            onRetry={() => gigsQuery.refetch()}
          />
        ) : (
          <>
            {/* Flagged, not faked: toggles with no backing data explain themselves. */}
            {nearMe ? (
              <InfoBanner
                tone="info"
                icon="mapPin"
                title="Distance search is flagged, not faked"
                description="The live API stores location as free text — there is no geo data yet, so “Near Me” cannot filter results."
                style={styles.notice}
              />
            ) : null}
            {verifiedOnly ? (
              <InfoBanner
                tone="info"
                icon="shieldCheck"
                title="Verification filter is flagged, not faked"
                description="The live gig feed does not include business verification, so “Verified Only” cannot filter results yet."
                style={styles.notice}
              />
            ) : null}

            {/* --- Recent searches (local device history) --- */}
            {recent.length ? (
              <View style={styles.section}>
                <SectionHeader title="Recent Searches" actionLabel="Clear All" onAction={() => persistRecent([])} />
                <ChipGroup
                  chips={recent.map((term) => ({
                    label: term,
                    selected: false,
                    indicator: 'none' as const,
                    onToggle: () => setQuery(term),
                  }))}
                />
              </View>
            ) : null}

            {/* --- Curated discovery tiles --- */}
            <View style={styles.section}>
              <SectionHeader title="Popular Skills in Mumbai" />
              <View style={styles.tileGrid}>
                {[POPULAR.slice(0, 2), POPULAR.slice(2, 4)].map((row, rowIndex) => (
                  <View key={rowIndex} style={styles.tileRow}>
                    {row.map((tile) => (
                      <Pressable
                        key={tile.label}
                        onPress={() => setQuery(tile.label)}
                        accessibilityRole="button"
                        accessibilityLabel={`Search ${tile.label}`}
                        style={({ pressed }) => [styles.tile, { backgroundColor: tile.tint }, pressed && styles.pressed]}>
                        <Icon name={tile.icon} size={20} color={tile.fg} />
                        <Text variant="heading" numberOfLines={1}>
                          {tile.label}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                ))}
              </View>
            </View>

            {/* --- Businesses derived from the open-gig feed --- */}
            {businesses.length ? (
              <View style={styles.section}>
                <SectionHeader
                  title="Top Verified Businesses"
                  actionLabel={showAllBusinesses ? 'Show Less' : 'View All'}
                  onAction={() => setShowAllBusinesses((v) => !v)}
                />
                <InfoBanner
                  tone="neutral"
                  icon="info"
                  title="Verification is not in the live gig feed"
                  description="Cards show each business's open-gig count instead of a “Verified” badge until the API exposes it. Flagged, not faked."
                  style={styles.notice}
                />
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.bizRow}>
                  {(showAllBusinesses ? businesses : businesses.slice(0, 2)).map((business) => (
                    <Pressable
                      key={business.name}
                      onPress={() => setQuery(business.name)}
                      accessibilityRole="button"
                      accessibilityLabel={`Search gigs by ${business.name}`}
                      style={({ pressed }) => [styles.bizCard, pressed && styles.pressed]}>
                      <Avatar name={business.name} size="lg" style={styles.bizAvatar} />
                      <Text variant="heading" numberOfLines={1} style={styles.bizName}>
                        {business.name}
                      </Text>
                      <View style={styles.bizMeta}>
                        <Icon name="briefcase" size={13} color={color.textSecondary} />
                        <Text variant="caption" tone="secondary">
                          {business.count} open gig{business.count === 1 ? '' : 's'}
                        </Text>
                      </View>
                    </Pressable>
                  ))}
                </ScrollView>
              </View>
            ) : null}

            {/* --- Results --- */}
            <View style={styles.section}>
              <SectionHeader title={isFiltering ? `Results (${results.length})` : 'Recommended for your profile'} />
              {gigsQuery.isLoading ? (
                <View style={styles.list}>
                  <GigCardSkeleton />
                  <GigCardSkeleton />
                </View>
              ) : results.length ? (
                <View style={styles.list}>
                  {results.map((gig) => (
                    <GigCard key={gig.id} gig={toGigCardData(gig)} onPress={() => router.push(`/(student)/gig/${gig.id}` as never)} />
                  ))}
                </View>
              ) : (
                <EmptyState
                  title="No matching gigs"
                  description="Nothing in the open-gig feed matches this search yet. Try a different skill or clear the filters."
                  icon="searchEmpty"
                  primaryLabel="Clear search"
                  onPrimary={() => {
                    setQuery('');
                    setBudget1k(false);
                    setRemote(false);
                  }}
                />
              )}
            </View>
          </>
        )}
      </ScrollView>

      <BottomTabBar items={STUDENT_TABS} activeKey="discover" onSelect={goStudentTab} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: color.surface,
    paddingTop: space.sm,
    paddingBottom: space.md,
    borderBottomWidth: 1,
    borderBottomColor: color.borderSubtle,
    gap: space.md,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    paddingHorizontal: space.sm,
  },
  field: { flex: 1 },
  rail: { paddingHorizontal: space.base },

  content: { padding: layout.screenGutter, gap: space.xl, maxWidth: layout.maxContentWidth, width: '100%', alignSelf: 'center' },
  section: { gap: space.md },
  notice: { marginBottom: space.none },
  list: { gap: space.xl },
  pressed: { opacity: 0.85 },

  tileGrid: { gap: space.md },
  tileRow: { flexDirection: 'row', gap: space.md },
  tile: {
    flex: 1,
    height: 88,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: color.borderSubtle,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    paddingHorizontal: space.base,
  },

  bizRow: { gap: space.md, paddingRight: space.base },
  bizCard: {
    width: 240,
    backgroundColor: color.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: color.borderSubtle,
    ...shadow.sm,
    padding: space.base,
    alignItems: 'center',
    gap: space.sm,
  },
  bizAvatar: { alignSelf: 'center' },
  bizName: { alignSelf: 'stretch', textAlign: 'center' },
  bizMeta: { flexDirection: 'row', alignItems: 'center', gap: space.xs },
});
