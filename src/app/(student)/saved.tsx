/**
 * Saved Gigs — FIXED production QA version.
 * Route: /(student)/saved
 *
 * Fixes:
 * - Now functional: reads saved IDs from AsyncStorage and shows real GigCards
 * - Bookmark toggle works, persistence across screens
 * - Filters functional (skill chips)
 * - Search action works
 * - Empty state with CTA
 * - Bottom nav fixed
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQuery } from '@tanstack/react-query';
import { router, useFocusEffect } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import {
  BottomTabBar,
  EmptyState,
  ErrorState,
  GigCard,
  Icon,
  IconButton,
  LoadingSkeleton,
  Screen,
  ScreenHeader,
  SelectableChip,
  Text,
} from '@/components/ui';
import { STUDENT_TABS, type TabItem } from '@/components/ui/BottomTabBar';
import { apiErrorMessage } from '@/config/api';
import { listGigs } from '@/lib/gig-api';
import { toGigCardData } from '@/lib/gig-card-data';
import { goStudentTab } from '@/lib/tab-nav';
import { useAuth } from '@/providers/auth-provider';
import { color } from '@/theme/colors';
import { layout, space } from '@/theme/spacing';

const SAVED_KEY = 'yuvaconnect:saved-gigs';

const SAVED_TABS: TabItem[] = STUDENT_TABS.map((tab) => (tab.key === 'mygigs' ? { key: 'saved', label: 'Saved', icon: 'bookmark', activeIcon: 'bookmarkFilled' } as TabItem : tab));

const RAIL = ['Design', 'Marketing', 'Tech', 'Writing', 'Photography', 'Development'];

export default function SavedGigsScreen() {
  const { token } = useAuth();
  const [skill, setSkill] = useState<string | null>(null);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());

  const loadSaved = async () => {
    try {
      const raw = await AsyncStorage.getItem(SAVED_KEY);
      if (raw) setSavedIds(new Set(JSON.parse(raw) as string[]));
    } catch {}
  };

  useEffect(() => {
    loadSaved();
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadSaved();
    }, []),
  );

  const gigsQuery = useQuery({
    queryKey: ['gigs', 'open', 'saved-screen'],
    queryFn: () => listGigs(token!, {}),
    enabled: !!token,
  });

  const toggleSave = async (gigId: string) => {
    const next = new Set(savedIds);
    if (next.has(gigId)) next.delete(gigId);
    else next.add(gigId);
    setSavedIds(next);
    await AsyncStorage.setItem(SAVED_KEY, JSON.stringify([...next]));
  };

  const filtered = useMemo(() => {
    const gigs = gigsQuery.data ?? [];
    let list = gigs.filter((g) => savedIds.has(g.id));
    if (skill) {
      const needle = skill.toLowerCase();
      list = list.filter((g) => g.skillsRequired.some((s) => s.toLowerCase().includes(needle)) || g.title.toLowerCase().includes(needle));
    }
    return list;
  }, [gigsQuery.data, savedIds, skill]);

  return (
    <Screen testID="screen-saved">
      <ScreenHeader title="Saved Gigs" subtitle={`${filtered.length} saved • Tap to view`} trailing={<IconButton name="search" accessibilityLabel="Search gigs" onPress={() => router.push('/(student)/search' as never)} />} />

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.rail}>
        <Pressable accessibilityRole="radio" accessibilityLabel="All saved gigs" accessibilityState={{ selected: skill === null }} onPress={() => setSkill(null)} style={styles.allChip}>
          <Icon name="check" size={15} color={color.textPrimary} />
          <Text variant="calloutStrong">All Gigs</Text>
        </Pressable>
        {RAIL.map((item) => (
          <SelectableChip key={item} label={item} selected={skill === item} indicator="none" onToggle={() => setSkill(skill === item ? null : item)} />
        ))}
      </ScrollView>

      <ScrollView style={{flex:1}} contentContainerStyle={[styles.content, {flexGrow:1}]} showsVerticalScrollIndicator={false}>
        {gigsQuery.isLoading ? (
          <LoadingSkeleton count={3} variant="card" />
        ) : gigsQuery.isError ? (
          <ErrorState title="Could not load gigs" description={apiErrorMessage(gigsQuery.error)} onRetry={() => gigsQuery.refetch()} />
        ) : filtered.length === 0 ? (
          <EmptyState
            title={savedIds.size === 0 ? 'Nothing saved yet' : `No saved ${skill} gigs`}
            description={
              savedIds.size === 0 ? 'Tap the bookmark icon on any gig card to save it here. Your saved gigs persist on this device.' : `No saved gigs match ${skill}. Try another filter.`
            }
            icon="bookmark"
            wellSize="lg"
            primaryLabel="Discover gigs"
            onPrimary={() => router.push('/(student)/feed' as never)}
            secondaryLabel="Search instead"
            onSecondary={() => router.push('/(student)/search' as never)}
          />
        ) : (
          filtered.map((gig) => (
            <GigCard key={gig.id} gig={toGigCardData(gig)} onPress={() => router.push(`/(student)/gig/${gig.id}` as never)} onBookmark={() => toggleSave(gig.id)} isBookmarked={savedIds.has(gig.id)} />
          ))
        )}
        <View style={styles.bottomPad} />
      </ScrollView>

      <BottomTabBar items={SAVED_TABS} activeKey="saved" onSelect={goStudentTab} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  rail: { gap: space.md, paddingHorizontal: layout.screenGutter, paddingVertical: space.md, alignItems: 'center' },
  allChip: { flexDirection: 'row', alignItems: 'center', gap: space.sm, paddingHorizontal: space.sm },
  content: {
    padding: layout.screenGutter,
    gap: space.base,
    maxWidth: layout.maxContentWidth,
    width: '100%',
    alignSelf: 'center',
    paddingBottom: 120,
  },
  bottomPad: { height: 20 },
});
