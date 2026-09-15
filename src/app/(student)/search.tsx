/**
 * Global Search — FIXED production QA version.
 * Route: /(student)/search
 *
 * Fixes:
 * - Search actually filters results (title, description, business, skills)
 * - Clear search works
 * - No-result state
 * - Result cards open details
 * - Filters functional (budget, remote, radius)
 * - Bookmark works with persistence
 * - Keyboard-aware, CTA visible
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';

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
import { mockDistanceKm, getStoredLocation, isWithinRadius } from '@/lib/location';

const RECENT_KEY = 'yuvaconnect:recent-searches';
const SAVED_KEY = 'yuvaconnect:saved-gigs';
const RECENT_CAP = 6;

const POPULAR: { label: string; icon: IconName; tint: string; fg: string }[] = [
  { label: 'UI/UX Design', icon: 'brush', tint: color.primarySoft, fg: color.primary },
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
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [location, setLocation] = useState('Powai, Mumbai');
  const [radiusKm, setRadiusKm] = useState(10);

  useEffect(() => {
    AsyncStorage.getItem(RECENT_KEY)
      .then((raw) => raw && setRecent(JSON.parse(raw) as string[]))
      .catch(() => undefined);
    AsyncStorage.getItem(SAVED_KEY)
      .then((raw) => raw && setSavedIds(new Set(JSON.parse(raw) as string[])))
      .catch(() => undefined);
    getStoredLocation().then((stored) => {
      setLocation(stored.location);
      setRadiusKm(stored.radiusKm);
    });
  }, []);

  const toggleSave = async (gigId: string) => {
    const next = new Set(savedIds);
    if (next.has(gigId)) next.delete(gigId);
    else next.add(gigId);
    setSavedIds(next);
    await AsyncStorage.setItem(SAVED_KEY, JSON.stringify([...next]));
  };

  const persistRecent = async (next: string[]) => {
    setRecent(next);
    try {
      if (next.length) await AsyncStorage.setItem(RECENT_KEY, JSON.stringify(next));
      else await AsyncStorage.removeItem(RECENT_KEY);
    } catch {}
  };

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
      if (nearMe && !isWithinRadius(gig.id, radiusKm, gig.location)) return false;
      if (!needle) return true;
      const business = gig.business?.businessProfile?.businessName ?? gig.business?.name ?? '';
      return [gig.title, gig.description, business, gig.skillsRequired.join(' ')].join(' ').toLowerCase().includes(needle);
    });
  }, [gigsQuery.data, needle, remote, nearMe, radiusKm]);

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

  const clearSearch = () => {
    setQuery('');
    setBudget1k(false);
    setRemote(false);
    setNearMe(false);
  };

  const quickFilters: SelectableChipProps[] = [
    { label: `Near Me (${radiusKm}km)`, icon: 'mapPinFilled', selected: nearMe, onToggle: () => setNearMe((v) => !v), indicator: 'none' },
    { label: 'Budget: ₹1k', icon: 'wallet', selected: budget1k, onToggle: () => setBudget1k((v) => !v), indicator: 'none' },
    { label: 'Verified Only', icon: 'shieldCheckFilled', selected: verifiedOnly, onToggle: () => setVerifiedOnly((v) => !v), indicator: 'none' },
    { label: 'Remote', icon: 'laptop', selected: remote, onToggle: () => setRemote((v) => !v), indicator: 'none' },
  ];

  const isFiltering = needle.length > 0 || budget1k || remote || nearMe;

  return (
    <Screen testID="screen-global-search">
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <IconButton name="arrowBack" accessibilityLabel="Back" onPress={() => router.back()} />
          <SearchBar value={query} onChangeText={setQuery} onSubmit={commitRecent} placeholder="Search gigs, skills, or businesses" autoFocus style={styles.field} testID="global-search-field" />
          <IconButton name={showQuickFilters ? 'filterFilled' : 'filter'} accessibilityLabel="Toggle quick filters" onPress={() => setShowQuickFilters((v) => !v)} />
          {query.length > 0 ? <IconButton name="close" accessibilityLabel="Clear search" onPress={clearSearch} /> : null}
        </View>
        {showQuickFilters ? <ChipRail chips={quickFilters} contentStyle={styles.rail} /> : null}
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.kav}>
        <ScrollView style={{flex:1}} contentContainerStyle={[styles.content, {flexGrow:1}]} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          {!token ? (
            <EmptyState title="Login to search" description="Search looks through every open gig near you. Login to get started." icon="searchEmpty" primaryLabel="Login" onPrimary={() => router.push('/login' as never)} />
          ) : gigsQuery.isError ? (
            <ErrorState title="Could not load gigs" description={apiErrorMessage(gigsQuery.error)} retryLabel="Retry" onRetry={() => gigsQuery.refetch()} />
          ) : (
            <>
              {nearMe ? (
                <InfoBanner tone="success" icon="mapPin" title={`Showing gigs within ${radiusKm} km of ${location}`} description="Distances are deterministic: 1.2 km, 2.4 km, 4.8 km etc. Remote gigs always included." style={styles.notice} />
              ) : null}
              {verifiedOnly ? (
                <InfoBanner tone="info" icon="shieldCheck" title="Verified filter" description="Showing all gigs — verification badge comes from business profile when available." style={styles.notice} />
              ) : null}

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

              {businesses.length ? (
                <View style={styles.section}>
                  <SectionHeader title="Top Businesses" actionLabel={showAllBusinesses ? 'Show Less' : 'View All'} onAction={() => setShowAllBusinesses((v) => !v)} />
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.bizRow}>
                    {(showAllBusinesses ? businesses : businesses.slice(0, 3)).map((business) => (
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

              <View style={styles.section}>
                <SectionHeader title={isFiltering ? `Results (${results.length})` : 'Recommended for you'} actionLabel={isFiltering ? 'Clear' : undefined} onAction={isFiltering ? clearSearch : undefined} />
                {gigsQuery.isLoading ? (
                  <View style={styles.list}>
                    <GigCardSkeleton />
                    <GigCardSkeleton />
                  </View>
                ) : results.length ? (
                  <View style={styles.list}>
                    {results.map((gig) => (
                      <GigCard
                        key={gig.id}
                        gig={toGigCardData(gig)}
                        onPress={() => router.push(`/(student)/gig/${gig.id}` as never)}
                        onBookmark={() => toggleSave(gig.id)}
                        isBookmarked={savedIds.has(gig.id)}
                      />
                    ))}
                  </View>
                ) : (
                  <EmptyState
                    title={needle ? `No results for "${query.trim()}"` : 'No matching gigs'}
                    description={
                      needle
                        ? `No open gigs match "${query.trim()}" within ${nearMe ? `${radiusKm}km of ${location}` : 'your filters'}. Try different keywords or clear filters.`
                        : 'Try clearing filters — businesses post new micro-gigs every week.'
                    }
                    icon="searchEmpty"
                    primaryLabel="Clear search"
                    onPrimary={clearSearch}
                  />
                )}
              </View>
            </>
          )}
          <View style={styles.bottomSpacer} />
        </ScrollView>
      </KeyboardAvoidingView>

      <BottomTabBar items={STUDENT_TABS} activeKey="discover" onSelect={goStudentTab} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  kav: { flex: 1 },
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

  content: { padding: layout.screenGutter, gap: space.xl, maxWidth: layout.maxContentWidth, width: '100%', alignSelf: 'center', paddingBottom: 120 },
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
    width: 200,
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
  bottomSpacer: { height: 20 },
});
