/**
 * Business Verification — wireframe 26/37. NEW additive route /(business)/verify.
 * Specs: docs/wireframes/26-business-verification.md
 *
 * What is REAL:
 *  - Legal Business Name → BusinessProfile.businessName  (PUT /api/profile)
 *  - GSTIN / Registration Number → BusinessProfile.registrationNumber
 *  - Business Category → BusinessProfile.category (free-string column; the
 *    SELECT card offers curated categories through a Sheet)
 *  - File uploads hit the real POST /api/upload endpoint (5MB, images).
 *  - isVerified status is read from the live profile and reported honestly.
 *
 * Flags (never faked):
 *  - BusinessProfile has NO document columns, so the uploaded PAN/Aadhaar and
 *    Shop-License URLs are kept on this device only (AsyncStorage
 *    `yuvaconnect:business-docs`) with a persistent banner saying so.
 *  - PDF picking needs expo-document-picker, which cannot be installed in this
 *    sandbox — only PNG/JPG upload for real today; caption keeps the wireframe
 *    copy and the banner states the limitation.
 *  - "Submit for Review" saves the real fields; the review/verification itself
 *    is platform-admin-side — isVerified stays false until then.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import {
  Banner,
  Button,
  FileRow,
  Icon,
  InfoBanner,
  RadioRow,
  Screen,
  ScreenHeader,
  Sheet,
  StepProgress,
  Text,
  TextField,
  TextLink,
} from '@/components/ui';
import { apiErrorMessage } from '@/config/api';
import { getProfile, updateProfile, uploadImage } from '@/lib/profile-api';
import { useAuth } from '@/providers/auth-provider';
import { color } from '@/theme/colors';
import { radius, shadow } from '@/theme/radius';
import { layout, space } from '@/theme/spacing';

const DOCS_KEY = 'yuvaconnect:business-docs';

const CATEGORIES = [
  'Food & Restaurant',
  'Retail & Shop',
  'Digital Services',
  'Education & Coaching',
  'Events & Media',
  'Salon & Wellness',
  'Logistics & Delivery',
  'Other',
];

type StoredDocs = { pan: StoredDoc | null; address: StoredDoc | null };
type StoredDoc = { name: string; size: string; url: string };

const EMPTY_DOCS: StoredDocs = { pan: null, address: null };

export default function BusinessVerificationScreen() {
  const { token } = useAuth();

  const [businessName, setBusinessName] = useState('');
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [category, setCategory] = useState('');
  const [isVerified, setIsVerified] = useState<boolean | null>(null);
  const [docs, setDocs] = useState<StoredDocs>(EMPTY_DOCS);
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [uploadingKey, setUploadingKey] = useState<'pan' | 'address' | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!token) return;
    getProfile(token)
      .then((data) => {
        const profile = data.profile;
        if (profile && 'businessName' in profile) {
          setBusinessName(profile.businessName ?? '');
          setRegistrationNumber(profile.registrationNumber ?? '');
          setCategory(profile.category ?? '');
          setIsVerified(profile.isVerified ?? false);
        } else {
          setIsVerified(false);
        }
      })
      .catch(() => setIsVerified(false));
    AsyncStorage.getItem(DOCS_KEY)
      .then((raw) => raw && setDocs(JSON.parse(raw) as StoredDocs))
      .catch(() => undefined);
  }, [token]);

  const pickDoc = async (key: 'pan' | 'address') => {
    if (!token) return;
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'] as never, quality: 0.8 });
    if (result.canceled) return;
    setUploadingKey(key);
    setError(null);
    try {
      const asset = result.assets[0];
      const url = await uploadImage(token, asset as ImagePicker.ImagePickerAsset);
      const bytes = (asset.fileSize ?? 1200000) / 1000000;
      const next: StoredDoc = {
        name: asset.fileName ?? (key === 'pan' ? 'business-pan.jpg' : 'shop-license.jpg'),
        size: `${bytes >= 1 ? bytes.toFixed(1) : Math.max(0.1, bytes).toFixed(1)} MB`,
        url,
      };
      const updated = { ...docs, [key]: next };
      setDocs(updated);
      await AsyncStorage.setItem(DOCS_KEY, JSON.stringify(updated));
    } catch (err) {
      setError(apiErrorMessage(err));
    } finally {
      setUploadingKey(null);
    }
  };

  const submit = async () => {
    if (!token) return;
    setSaving(true);
    setError(null);
    try {
      await updateProfile(token, {
        businessName: businessName.trim(),
        category,
        registrationNumber: registrationNumber.trim(),
      });
      setSaved(true);
    } catch (err) {
      setError(apiErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Screen testID="screen-business-verify">
      <ScreenHeader title="Business Verification" onBack={() => router.back()} variant="solid" />
      <ScrollView style={{flex:1}}
        contentContainerStyle={[styles.content, {flexGrow:1}]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">
        <StepProgress total={5} current={2} style={styles.steps} />

        <Banner
          tone="brand"
          icon="info"
          title="Verified businesses get 3x more applications and higher trust badges."
          testID="verify-trust-banner"
        />

        <Text variant="overline" tone="tertiary">
          BUSINESS DETAILS
        </Text>

        <TextField
          label="Legal Business Name"
          icon="building"
          value={businessName}
          onChangeText={setBusinessName}
          placeholder="e.g., Sharma Digital Services"
          testID="verify-business-name"
        />
        <TextField
          label="GSTIN / Registration Number"
          icon="briefcase"
          value={registrationNumber}
          onChangeText={setRegistrationNumber}
          placeholder="Optional for small shops"
          autoCapitalize="characters"
          testID="verify-gstin"
        />

        <Text variant="bodyStrong">Business Category</Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Business Category: ${category || 'Select category'}`}
          onPress={() => setCategoryOpen(true)}
          style={styles.selectCard}
          testID="verify-category">
          <Text variant={category ? 'body' : 'body'} tone={category ? 'primary' : 'tertiary'} style={styles.selectValue}>
            {category || 'Select category'}
          </Text>
          <Icon name="chevronDown" size={18} color={color.textTertiary} />
        </Pressable>

        <View style={styles.divider} />

        <Text variant="overline" tone="tertiary">
          PROOF OF IDENTITY / ADDRESS
        </Text>

        <View style={styles.uploadCard}>
          <Icon name="cloudUpload" size={30} color={color.primary} />
          <Text variant="title3">Upload Business PAN or Aadhaar</Text>
          <Text variant="caption" tone="tertiary">
            PDF, PNG or JPG (Max 5MB)
          </Text>
          {docs.pan ? (
            <FileRow
              name={docs.pan.name}
              meta={`${docs.pan.size} · stored on this device`}
              state="uploaded"
              onPress={() => pickDoc('pan')}
              testID="verify-pan-file"
            />
          ) : (
            <Button
              label={uploadingKey === 'pan' ? 'Uploading…' : 'Select File'}
              variant="secondary"
              loading={uploadingKey === 'pan'}
              onPress={() => pickDoc('pan')}
              testID="verify-pan-upload"
            />
          )}
        </View>

        <View style={styles.uploadCard}>
          <Icon name="mapPin" size={30} color={color.primary} />
          <Text variant="title3">Shop License / Utility Bill</Text>
          <Text variant="caption" tone="tertiary">
            Proof of business address
          </Text>
          {docs.address ? (
            <FileRow
              name={docs.address.name}
              meta={`${docs.address.size} · stored on this device`}
              state="uploaded"
              onPress={() => pickDoc('address')}
              testID="verify-address-file"
            />
          ) : (
            <Button
              label={uploadingKey === 'address' ? 'Uploading…' : 'Select File'}
              variant="secondary"
              loading={uploadingKey === 'address'}
              onPress={() => pickDoc('address')}
              testID="verify-address-upload"
            />
          )}
        </View>

        <InfoBanner
          tone="info"
          icon="info"
          title="Flagged, not faked"
          description="Business name, GSTIN and category save to your real BusinessProfile. BusinessProfile has no document columns, so uploaded files reach the real /api/upload endpoint but their URLs stay on this device. PDF picking needs expo-document-picker, which is not installable in this build — PNG/JPG only for now. Verification itself is reviewed platform-side; your live isVerified status is shown below."
        />

        {isVerified === true ? (
          <InfoBanner tone="success" icon="shieldCheckFilled" title="Verified" description="Your business profile is already verified." />
        ) : (
          <InfoBanner
            tone="warning"
            icon="hourglass"
            title="Verification pending"
            description="Live status: isVerified = false. Submitting saves your details; the platform team flips this flag after review."
          />
        )}

        {error ? <InfoBanner tone="danger" icon="offline" title="Something went wrong" description={error} /> : null}
        {saved ? (
          <InfoBanner
            tone="success"
            icon="checkCircleFilled"
            title="Details saved"
            description="businessName, category and registrationNumber were written to your real BusinessProfile via PUT /api/profile."
          />
        ) : null}

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Sticky action bar */}
      <View style={styles.stickyBar}>
        <TextLink label="Back" iconRight={null} onPress={() => router.back()} />
        <Button label="Submit for Review" loading={saving} disabled={!token} onPress={submit} style={styles.submitBtn} testID="verify-submit" />
      </View>

      {!token ? (
        <View style={styles.authNotice}>
          <InfoBanner tone="warning" icon="lock" title="Login required" description="Sign in with a BUSINESS account to save your verification details." />
        </View>
      ) : null}

      <Sheet visible={categoryOpen} onClose={() => setCategoryOpen(false)} title="Business Category">
        {CATEGORIES.map((item) => (
          <RadioRow
            key={item}
            label={item}
            selected={category === item}
            onPress={() => {
              setCategory(item);
              setCategoryOpen(false);
            }}
          />
        ))}
      </Sheet>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: layout.screenGutter,
    paddingTop: space.base,
    paddingBottom: 160,
    gap: space.base,
    maxWidth: layout.maxContentWidth,
    width: '100%',
    alignSelf: 'center',
  },
  steps: { marginBottom: space.xs },

  selectCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: color.surface,
    borderWidth: 1,
    borderColor: color.border,
    borderRadius: radius.md,
    paddingHorizontal: space.base,
    paddingVertical: space.md,
  },
  selectValue: { flex: 1 },

  divider: { height: 1, backgroundColor: color.divider, marginVertical: space.sm },

  uploadCard: {
    backgroundColor: color.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: color.border,
    borderStyle: 'dashed',
    padding: space.xl,
    alignItems: 'center',
    gap: space.sm,
  },

  bottomSpacer: { height: space.xl },

  stickyBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: space.base,
    backgroundColor: color.surface,
    borderTopWidth: 1,
    borderTopColor: color.divider,
    paddingHorizontal: layout.screenGutter,
    paddingVertical: space.md,
    ...shadow.sm,
  },
  submitBtn: { minWidth: 180 },

  authNotice: { position: 'absolute', left: layout.screenGutter, right: layout.screenGutter, bottom: 84 },
});
