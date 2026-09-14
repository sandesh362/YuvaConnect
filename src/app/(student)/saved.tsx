/**
 * Saved Gigs — wireframe 22/37. USER DECISION: ship-empty + flagged.
 *
 * Route: /saved (new, additive). Spec: docs/wireframes/22-saved-gigs.md
 *
 * There is NO SavedGig collection in the live backend. Per the approved
 * decision the screen ships as the exact wireframe chrome — header, search
 * action, check-mark skill rail, Saved tab — over an honest EmptyState. No
 * fake cards, no pretended persistence; bookmark taps on other screens keep
 * their explanatory banners. The moment the backend gains the collection,
 * this list renders real GigCards through the shared toGigCardData mapper.
 */
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import {
  BottomTabBar,
  EmptyState,
  Icon,
  IconButton,
  InfoBanner,
  Screen,
  ScreenHeader,
  SelectableChip,
  Text,
} from '@/components/ui';
import { STUDENT_TABS, type TabItem } from '@/components/ui/BottomTabBar';
import { goStudentTab } from '@/lib/tab-nav';
import { color } from '@/theme/colors';
import { layout, space } from '@/theme/spacing';

/** Saved export swaps My Gigs for Saved in the tab bar (per-export variant). */
const SAVED_TABS: TabItem[] = STUDENT_TABS.flatMap((tab) =>
  tab.key === 'mygigs'
    ? [{ key: 'saved', label: 'Saved', icon: 'bookmark', activeIcon: 'bookmarkFilled' } as TabItem]
    : [tab],
);

const RAIL = ['Design', 'Marketing', 'Tech', 'Writing'];

export default function SavedGigsScreen() {
  const [skill, setSkill] = useState<string | null>(null);

  return (
    <Screen testID="screen-saved">
      <ScreenHeader
        title="Saved Gigs"
        subtitle="Opportunities you're interested in"
        trailing={<IconButton name="search" accessibilityLabel="Search gigs" onPress={() => router.push('/search' as never)} />}
      />

      {/* --- Check-mark rail (wireframe chrome; list below is the honest part) --- */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.rail}>
        <Pressable
          accessibilityRole="radio"
          accessibilityLabel="All saved gigs"
          accessibilityState={{ selected: skill === null }}
          onPress={() => setSkill(null)}
          style={styles.allChip}>
          <Icon name="check" size={15} color={color.textPrimary} />
          <Text variant="calloutStrong">All Gigs</Text>
        </Pressable>
        {RAIL.map((item) => (
          <SelectableChip key={item} label={item} selected={skill === item} indicator="none" onToggle={() => setSkill(skill === item ? null : item)} />
        ))}
      </ScrollView>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <InfoBanner
          tone="neutral"
          icon="bookmark"
          title="No Saved Gigs backend yet"
          description="The live API has no SavedGig collection, so nothing can persist here — bookmark taps elsewhere explain this instead of pretending to save. This list will render real GigCards the moment the collection exists."
        />
        <EmptyState
          title="Nothing saved yet"
          description={skill ? `No saved ${skill} gigs — because saves cannot persist yet.` : 'Gigs you bookmark will collect here once the Saved Gigs backend ships.'}
          icon="bookmark"
          wellSize="lg"
          primaryLabel="Discover gigs"
          onPrimary={() => router.push('/(student)/feed' as never)}
          secondaryLabel="Search instead"
          onSecondary={() => router.push('/search' as never)}
          secondaryAsLink
        />
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
    gap: space.xl,
    maxWidth: layout.maxContentWidth,
    width: '100%',
    alignSelf: 'center',
    paddingBottom: space['2xl'],
  },
});
