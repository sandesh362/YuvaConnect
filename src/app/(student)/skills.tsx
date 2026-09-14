/**
 * Student Skill Selection — FIXED production QA version.
 * Route: /skills
 *
 * Fixes:
 * - KAV + bottom padding 120
 * - Continue navigates to /location after save (completes onboarding flow)
 * - Search functional, chip selection works
 * - BottomActionBar always visible
 */
import { router } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { BottomActionBar, Button, ChipGroup, Icon, InfoBanner, Screen, SearchBar, StepProgress, Text, TextLink } from '@/components/ui';
import { apiErrorMessage } from '@/config/api';
import { getProfile, updateProfile } from '@/lib/profile-api';
import { useAuth } from '@/providers/auth-provider';
import { color } from '@/theme/colors';
import { radius } from '@/theme/radius';
import { layout, space } from '@/theme/spacing';

const GROUPS: { title: string; skills: string[] }[] = [
  { title: 'Design & Creative', skills: ['Graphic Design', 'UI/UX Design', 'Logo Design', 'Illustration', 'Motion Graphics', 'Product Photography'] },
  { title: 'Marketing & Social', skills: ['Social Media Management', 'Content Writing', 'SEO', 'Ad Campaigns', 'Influencer Outreach'] },
  { title: 'Development & IT', skills: ['Web Development', 'App Development', 'Data Entry', 'Python', 'Shopify/E-commerce'] },
];

const MIN_SKILLS = 3;

export default function SkillSelectionScreen() {
  const { token } = useAuth();
  const [skills, setSkills] = useState<string[]>([]);
  const [query, setQuery] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!token) return;
    getProfile(token)
      .then((data) => {
        const profile = data.profile;
        if (profile && 'skills' in profile) setSkills(profile.skills ?? []);
      })
      .catch(() => undefined);
  }, [token]);

  const needle = query.trim().toLowerCase();

  const groups = useMemo(
    () =>
      GROUPS.map((group) => ({
        ...group,
        skills: needle ? group.skills.filter((skill) => skill.toLowerCase().includes(needle)) : group.skills,
      })).filter((group) => group.skills.length > 0),
    [needle],
  );

  const toggle = (skill: string) => setSkills((current) => (current.includes(skill) ? current.filter((item) => item !== skill) : [...current, skill]));

  const save = async () => {
    if (!token || skills.length < MIN_SKILLS) return;
    setSaving(true);
    setError(null);
    try {
      await updateProfile(token, { skills });
      setSaved(true);
      router.push('/(student)/location' as never);
    } catch (err) {
      setError(apiErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const ready = skills.length >= MIN_SKILLS;

  return (
    <Screen testID="screen-skills">
      <StepProgress total={5} current={3} style={styles.steps} />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <View style={styles.intro}>
          <Text variant="title1">What are your skills?</Text>
          <Text variant="body" tone="secondary">
            Select at least {MIN_SKILLS} skills to help us match you with the right micro-gigs.
          </Text>
        </View>

        <View style={styles.searchBlock}>
          <Text variant="label" tone="secondary">
            Search skills
          </Text>
          <SearchBar value={query} onChangeText={setQuery} placeholder="e.g. Photoshop, Python..." testID="skills-search" />
        </View>

        <View style={styles.countRow}>
          <Text variant="title2">Selected Skills</Text>
          <View style={styles.countPill} accessibilityLabel={`${skills.length} selected`}>
            <Text variant="captionStrong" style={styles.countText}>
              {skills.length} Selected
            </Text>
          </View>
        </View>

        {groups.length === 0 ? (
          <InfoBanner tone="neutral" icon="searchEmpty" title="No skill matches that search" description="Try another term, or clear the search to see the full catalogue." />
        ) : (
          groups.map((group) => (
            <View key={group.title} style={styles.group}>
              <Text variant="calloutStrong" tone="secondary">
                {group.title}
              </Text>
              <ChipGroup
                chips={group.skills.map((skill) => ({
                  label: skill,
                  selected: skills.includes(skill),
                  onToggle: () => toggle(skill),
                }))}
              />
            </View>
          ))
        )}

        <View style={styles.noticeCard}>
          <Icon name="shieldCheckFilled" size={22} color={color.success} />
          <Text variant="callout" tone="secondary" style={styles.noticeCopy}>
            Skills are verified through your portfolio and business ratings.
          </Text>
        </View>

        {error ? <InfoBanner tone="danger" icon="offline" title="Could not save skills" description={error} /> : null}
        {saved ? <InfoBanner tone="success" icon="checkCircleFilled" title="Skills saved to your profile" /> : null}
        {!ready ? (
          <Text variant="caption" tone="tertiary">
            Pick {MIN_SKILLS - skills.length} more skill{MIN_SKILLS - skills.length === 1 ? '' : 's'} to continue.
          </Text>
        ) : null}
        <View style={styles.bottomPad} />
      </ScrollView>

      <BottomActionBar>
        <View style={styles.bar}>
          <TextLink label="Back" iconRight={null} onPress={() => router.back()} style={styles.barBack} />
          <Button label="Continue" loading={saving} disabled={!ready} onPress={save} style={styles.barContinue} testID="skills-continue" />
        </View>
      </BottomActionBar>
    </Screen>
  );
}

const styles = StyleSheet.create({
  steps: { paddingHorizontal: layout.screenGutter, paddingTop: space.xl, paddingBottom: space.md },
  content: {
    paddingHorizontal: layout.screenGutter,
    gap: space.xl,
    maxWidth: layout.maxContentWidth,
    width: '100%',
    alignSelf: 'center',
    paddingBottom: 120,
  },
  intro: { gap: space.md },
  searchBlock: { gap: space.sm },
  countRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  countPill: { backgroundColor: color.primarySoft, borderRadius: radius.full, paddingHorizontal: space.base, paddingVertical: space.xs },
  countText: { color: color.primaryText },
  group: { gap: space.md },
  noticeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    backgroundColor: color.surfaceMuted,
    borderRadius: radius.md,
    paddingHorizontal: space.base,
    paddingVertical: space.base,
  },
  noticeCopy: { flex: 1, lineHeight: 20 },
  bottomPad: { height: 20 },
  bar: { flexDirection: 'row', alignItems: 'center', gap: space.md, width: '100%' },
  barBack: { paddingHorizontal: space.md },
  barContinue: { flex: 3 },
});
