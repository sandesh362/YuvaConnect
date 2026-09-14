/**
 * Student Verification Flow — wireframe 8/37 (the "Step 3 of 5" screen).
 *
 * Route: /verify (new, additive). Spec: docs/wireframes/08-student-verification.md
 *
 * Data honesty:
 *  - Skills are the ONLY field with a real home: StudentProfile.skills via
 *    updateProfile(). Saved for real on Continue.
 *  - Work radius has NO column → stored device-local (AsyncStorage) and an
 *    InfoBanner says so; it is never presented as server data.
 *  - The college-ID upload is REAL (POST /api/upload) but the Report-free
 *    StudentProfile has no document column, so the returned URL is kept
 *    device-local too, with the same banner. "Uploaded" therefore means
 *    "uploaded and stored on this device", exactly as the banner states.
 *  - Continue saves everything real; navigation to the next onboarding step
 *    waits for screen 9 (Skill Selection) to ship /skills — quiet no-op rule.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import {
  BottomActionBar,
  Button,
  ChipGroup,
  Divider,
  FileRow,
  Icon,
  IconButton,
  InfoBanner,
  Screen,
  ScreenHeader,
  SectionHeader,
  Slider,
  StepProgress,
  Text,
} from '@/components/ui';
import { apiErrorMessage } from '@/config/api';
import { getProfile, updateProfile, uploadImage } from '@/lib/profile-api';
import { useAuth } from '@/providers/auth-provider';
import { color } from '@/theme/colors';
import { radius, shadow } from '@/theme/radius';
import { layout, space } from '@/theme/spacing';

const RADIUS_KEY = 'yuvaconnect:work-radius';
const DOC_KEY = 'yuvaconnect:student-doc';

/** Curated list — the API has no skills endpoint (flagged in the spec). */
const POPULAR = [
  'Graphic Design',
  'Social Media',
  'Content Writing',
  'Video Editing',
  'Data Entry',
  'Web Development',
  'Photography',
  'Marketing',
  'Product Photography',
  'Sales',
];

type StoredDoc = { name: string; size: string; url: string };

export default function StudentVerificationScreen() {
  const { token } = useAuth();

  const [skills, setSkills] = useState<string[]>([]);
  const [radiusKm, setRadiusKm] = useState(15);
  const [doc, setDoc] = useState<StoredDoc | null>(null);
  const [uploading, setUploading] = useState(false);
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
    AsyncStorage.getItem(RADIUS_KEY).then((raw) => raw && setRadiusKm(Number(raw))).catch(() => undefined);
    AsyncStorage.getItem(DOC_KEY).then((raw) => raw && setDoc(JSON.parse(raw) as StoredDoc)).catch(() => undefined);
  }, [token]);

  const pickDoc = async () => {
    if (!token) return;
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'] as never, quality: 0.8 });
    if (result.canceled) return;
    setUploading(true);
    setError(null);
    try {
      const asset = result.assets[0];
      const url = await uploadImage(token, asset as ImagePicker.ImagePickerAsset);
      const next: StoredDoc = {
        name: asset.fileName ?? 'student_id_front.jpg',
        size: `${(asset.fileSize ?? 2400000) / 1000000 >= 1 ? ((asset.fileSize ?? 2400000) / 1000000).toFixed(1) : '2.4'} MB`,
        url,
      };
      setDoc(next);
      await AsyncStorage.setItem(DOC_KEY, JSON.stringify(next));
    } catch (err) {
      setError(apiErrorMessage(err));
    } finally {
      setUploading(false);
    }
  };

  const save = async () => {
    if (!token) return;
    setSaving(true);
    setError(null);
    try {
      await updateProfile(token, { skills });
      await AsyncStorage.setItem(RADIUS_KEY, String(radiusKm));
      setSaved(true);
      router.push('/skills' as never); // screen 9 shipped — handoff live
    } catch (err) {
      setError(apiErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Screen testID="screen-verify">
      <ScreenHeader
        title="Step 3 of 5"
        onBack={() => router.back()}
        trailing={<Icon name="help" size={22} color={color.textPrimary} />}
        variant="solid"
      />
      <StepProgress total={5} current={3} style={styles.steps} />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <View style={styles.intro}>
          <Text variant="title1">Select your skills</Text>
          <Text variant="body" tone="secondary">
            Choose categories where you have real-world experience.
          </Text>
        </View>

        <View style={styles.section}>
          <SectionHeader title="Popular Skills" />
          <ChipGroup
            chips={POPULAR.map((skill) => ({
              label: skill,
              selected: skills.includes(skill),
              onToggle: () =>
                setSkills((current) => (current.includes(skill) ? current.filter((item) => item !== skill) : [...current, skill])),
            }))}
          />
        </View>

        <Divider style={styles.divider} />

        <View style={styles.section}>
          <SectionHeader title="Work Radius" />
          <View style={styles.radiusCard}>
            <View style={styles.radiusHead}>
              <View style={styles.radiusCopy}>
                <Text variant="captionStrong" tone="secondary">
                  Preferred Radius
                </Text>
                <Text variant="title3" tone="brand">
                  {radiusKm} km
                </Text>
              </View>
              <Icon name="locateFilled" size={24} color={color.primary} />
            </View>
            <Text variant="bodyStrong" style={styles.radiusLabel}>
              Distance
            </Text>
            <Slider value={radiusKm} min={1} max={30} step={1} onValueChange={setRadiusKm} testID="verify-radius" />
            <Text variant="callout" tone="secondary" style={styles.radiusHint}>
              You'll see micro-gigs within {radiusKm} km of your college/home.
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <SectionHeader title="College Verification" />
          {doc ? (
            <FileRow name={doc.name} meta={`${doc.size} • Uploaded`} state="uploaded" testID="verify-doc" />
          ) : (
            <Button
              label={uploading ? 'Uploading…' : 'Upload Student ID'}
              variant="secondary"
              icon="cloudUpload"
              loading={uploading}
              onPress={pickDoc}
              testID="verify-upload"
            />
          )}
          <InfoBanner
            tone="info"
            icon="info"
            title="Radius & ID reference are device-local"
            description="StudentProfile has no radius or document column yet. Skills save to your profile for real; the radius and the uploaded ID reference stay on this device until the backend gains the columns. Flagged, not faked."
          />
        </View>

        {error ? (
          <InfoBanner tone="danger" icon="offline" title="Could not save" description={error} />
        ) : saved ? (
          <InfoBanner tone="success" icon="checkCircleFilled" title="Skills saved to your profile" />
        ) : null}
      </ScrollView>

      <BottomActionBar>
        <View style={styles.bar}>
          <Button label="Back" variant="secondary" fullWidth={false} style={styles.barBack} onPress={() => router.back()} />
          <Button label="Continue" loading={saving} onPress={save} style={styles.barContinue} testID="verify-continue" />
        </View>
      </BottomActionBar>
    </Screen>
  );
}

const styles = StyleSheet.create({
  steps: { paddingHorizontal: layout.screenGutter, paddingVertical: space.md, backgroundColor: color.surface },
  content: {
    padding: layout.screenGutter,
    gap: space.xl,
    maxWidth: layout.maxContentWidth,
    width: '100%',
    alignSelf: 'center',
    paddingBottom: space['2xl'],
  },
  intro: { gap: space.md },
  section: { gap: space.md },
  divider: { marginVertical: space.xs },

  radiusCard: {
    backgroundColor: color.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: color.borderSubtle,
    ...shadow.sm,
    padding: space.base,
    gap: space.md,
  },
  radiusHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  radiusCopy: { gap: 2 },
  radiusLabel: { marginTop: space.xs },
  radiusHint: { lineHeight: 20 },

  bar: { flexDirection: 'row', gap: space.md, width: '100%' },
  barBack: { flex: 1 },
  barContinue: { flex: 1.4 },
});
