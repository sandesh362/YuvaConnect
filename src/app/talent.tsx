/**
 * Saved Talent ("Talent Pool") — wireframe 37/37. USER DECISION: ship-empty +
 * flagged (same treatment as Saved Gigs, screen 22).
 *
 * Route: /talent (new, additive — real root file for the literal URL).
 * Spec: docs/wireframes/37-saved-talent.md
 *
 * There is NO SavedTalent model in the live backend: nothing can be saved,
 * listed, matched or invited. Per the approved decision the screen ships the
 * exact wireframe chrome — header, search row, mint sliders square, Talent
 * tab — over an honest EmptyState and a flag banner. No fake cards, no fake
 * match %, no fake availability values. The hearts on Candidate Profiles
 * (screen 30) raise the same flag. The moment the backend gains the model,
 * this list renders real candidates through the shared CandidateCard.
 *
 * Export-bug note: the wireframe's "$rating" literal is NOT reproduced — the
 * spec itself says render the real avgRating (moot while the list is empty).
 */
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { BottomTabBar, EmptyState, Icon, InfoBanner, Screen, ScreenHeader, Text } from '@/components/ui';
import { BUSINESS_TABS, type TabItem } from '@/components/ui/BottomTabBar';
import { goBusinessTab } from '@/lib/tab-nav';
import { color } from '@/theme/colors';
import { radius } from '@/theme/radius';
import { layout, space } from '@/theme/spacing';

/** Per-export variant (approved pattern): this screen owns the Talent tab. */
const TALENT_TABS: TabItem[] = BUSINESS_TABS.map((tab) =>
  tab.key === 'messages' ? ({ key: 'talent', label: 'Talent', icon: 'people', activeIcon: 'peopleFilled' } as TabItem) : tab,
);

export default function TalentPoolScreen() {
  const [notice, setNotice] = useState<string | null>(null);

  return (
    <Screen testID="screen-talent-pool">
      <ScreenHeader title="Talent Pool" subtitle="Verified students you've saved for future work" />

      <ScrollView style={{flex:1}} contentContainerStyle={[styles.content, {flexGrow:1}]} showsVerticalScrollIndicator={false}>
        {/* Search row — wireframe chrome; nothing exists to search yet */}
        <View style={styles.searchRow}>
          <Pressable
            accessibilityRole="search"
            accessibilityLabel="Search saved talent (flagged)"
            onPress={() => setNotice('Saved Talent has no backend model — there is nothing to search until the collection ships. The row is kept per the wireframe and flagged, not faked.')}
            style={({ pressed }) => [styles.searchField, pressed && styles.pressed]}
            testID="talent-search">
            <Icon name="search" size={18} color={color.textTertiary} />
            <Text variant="body" tone="tertiary">
              Search saved talent...
            </Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Talent filters (flagged)"
            onPress={() => setNotice('Filters need saved talent to filter — the backend model does not exist yet. Flagged, not faked.')}
            style={({ pressed }) => [styles.slidersSquare, pressed && styles.pressed]}
            testID="talent-filters">
            <Icon name="options" size={20} color={color.textPrimary} />
          </Pressable>
        </View>

        {notice ? <InfoBanner tone="warning" icon="info" title="Flagged, not faked" description={notice} /> : null}

        <InfoBanner
          tone="info"
          icon="info"
          title="No SavedTalent backend"
          description="The live schema has no SavedTalent model, no match-score column and no invite endpoint. This screen ships honestly empty per the approved decision (same as Saved Gigs) — the hearts on Candidate Profiles raise the same flag. When the model lands, cards render through the shared CandidateCard with real ratings and availability."
        />

        <EmptyState
          title="No saved talent yet"
          description="Nothing can be saved until the backend gains the SavedTalent collection. Candidate profiles, applicants and comparison are all live — this pool just cannot hold them yet."
          icon="people"
          wellSize="lg"
          primaryLabel="Manage Gigs"
          onPrimary={() => router.push('/(business)/my-gigs' as never)}
        />
      </ScrollView>

      <BottomTabBar items={TALENT_TABS} activeKey="talent" onSelect={goBusinessTab} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: layout.screenGutter,
    paddingTop: space.base,
    paddingBottom: 120,
    gap: space.base,
    maxWidth: layout.maxContentWidth,
    width: '100%',
    alignSelf: 'center',
  },
  searchRow: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  searchField: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    backgroundColor: color.surface,
    borderWidth: 1,
    borderColor: color.border,
    borderRadius: radius.md,
    paddingHorizontal: space.base,
    paddingVertical: space.md,
  },
  slidersSquare: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: color.successSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: { opacity: 0.7 },
});
