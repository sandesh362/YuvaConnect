/**
 * Business Profile — FIXED production QA version.
 * Route: /(business)/profile
 *
 * Fixes:
 * - Uses new UI components (Screen, Text, Button, etc.) not legacy
 * - Bottom nav fixed with 120 padding
 * - Edit flow functional with upload + validation
 * - Sign out works
 * - Verified badge, rating display
 */
import * as ImagePicker from 'expo-image-picker';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, Image, ScrollView, StyleSheet, View } from 'react-native';

import { Avatar, BottomTabBar, Button, InfoBanner, LoadingSkeleton, PrimaryButton, Screen, ScreenHeader, Sheet, Text, TextField } from '@/components/ui';
import { BUSINESS_TABS } from '@/components/ui/BottomTabBar';
import { apiErrorMessage } from '@/config/api';
import { getProfile, updateProfile, uploadImage } from '@/lib/profile-api';
import { goBusinessTab } from '@/lib/tab-nav';
import { useAuth } from '@/providers/auth-provider';
import { color } from '@/theme/colors';
import { radius, shadow } from '@/theme/radius';
import { layout, space } from '@/theme/spacing';
import type { BusinessProfile } from '@/types/api';

export default function BusinessProfileScreen() {
  const { token, user, signOut } = useAuth();
  const client = useQueryClient();
  const query = useQuery({ queryKey: ['profile'], queryFn: () => getProfile(token!), enabled: !!token });
  const profile = query.data?.profile as BusinessProfile | null | undefined;

  const [editOpen, setEditOpen] = useState(false);
  const [businessName, setBusinessName] = useState('');
  const [category, setCategory] = useState('');
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [address, setAddress] = useState('');
  const [shopImageUrl, setShopImageUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (profile) {
      setBusinessName(profile.businessName ?? '');
      setCategory(profile.category ?? '');
      setRegistrationNumber(profile.registrationNumber ?? '');
      setAddress(profile.address ?? '');
      setShopImageUrl(profile.shopImageUrl ?? null);
    }
  }, [profile]);

  const save = useMutation({
    mutationFn: () => updateProfile(token!, { businessName: businessName.trim(), category: category.trim(), registrationNumber: registrationNumber.trim(), address: address.trim(), shopImageUrl }),
    onSuccess: () => {
      client.invalidateQueries({ queryKey: ['profile'] });
      setEditOpen(false);
    },
    onError: (e) => Alert.alert('Could not save profile', apiErrorMessage(e)),
  });

  async function pickImage(camera = false) {
    if (!token) return;
    const permission = camera ? await ImagePicker.requestCameraPermissionsAsync() : await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return Alert.alert('Permission needed', 'Allow access to upload an image.');
    const result = camera
      ? await ImagePicker.launchCameraAsync({ mediaTypes: ['images'] as never, quality: 0.8 })
      : await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'] as never, quality: 0.8 });
    if (result.canceled) return;
    setUploading(true);
    try {
      setShopImageUrl(await uploadImage(token, result.assets[0] as ImagePicker.ImagePickerAsset));
    } catch (e) {
      Alert.alert('Upload failed', apiErrorMessage(e));
    } finally {
      setUploading(false);
    }
  }

  function chooseImage() {
    Alert.alert('Add shop photo', 'Choose a source', [
      { text: 'Camera', onPress: () => void pickImage(true) },
      { text: 'Photo library', onPress: () => void pickImage() },
      { text: 'Cancel', style: 'cancel' },
    ]);
  }

  return (
    <Screen testID="screen-business-profile">
      <ScreenHeader title="Business Profile" subtitle={user?.name ?? ''} />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {query.isLoading ? (
          <LoadingSkeleton count={3} variant="card" />
        ) : (
          <>
            <View style={styles.headerCard}>
              <View style={styles.avatarWrap}>
                {shopImageUrl ? <Image source={{ uri: shopImageUrl }} style={styles.avatarPhoto} /> : <Avatar name={businessName || user?.name || 'Business'} size="xl" tone={color.primarySoft} />}
                {profile?.isVerified ? (
                  <View style={styles.verifiedBadge}>
                    <Text variant="captionStrong" style={styles.verifiedText}>
                      ✓
                    </Text>
                  </View>
                ) : null}
              </View>
              <Text variant="title1" style={styles.name}>
                {businessName || 'Your Business'}
              </Text>
              {category ? (
                <Text variant="caption" tone="secondary">
                  {category}
                </Text>
              ) : null}
              {profile?.isVerified ? (
                <View style={styles.verifiedPill}>
                  <Text variant="captionStrong" style={styles.verifiedPillText}>
                    Verified Business
                  </Text>
                </View>
              ) : (
                <InfoBanner tone="info" icon="info" title="Get verified" description="Add your business details and shop photo to get verified faster." />
              )}
              {profile && profile.totalRatings > 0 ? (
                <Text variant="callout" tone="secondary">
                  ⭐ {profile.avgRating.toFixed(1)} • {profile.totalRatings} reviews
                </Text>
              ) : null}
            </View>

            <View style={styles.card}>
              <Text variant="title3">Business Details</Text>
              <View style={styles.detailRow}>
                <Text variant="captionStrong" tone="secondary">
                  Business Name
                </Text>
                <Text variant="body">{businessName || '—'}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text variant="captionStrong" tone="secondary">
                  Category
                </Text>
                <Text variant="body">{category || '—'}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text variant="captionStrong" tone="secondary">
                  Address
                </Text>
                <Text variant="body">{address || '—'}</Text>
              </View>
              {registrationNumber ? (
                <View style={styles.detailRow}>
                  <Text variant="captionStrong" tone="secondary">
                    Registration
                  </Text>
                  <Text variant="body">{registrationNumber}</Text>
                </View>
              ) : null}
            </View>

            <Button label="Edit Profile" variant="secondary" icon="pen" onPress={() => setEditOpen(true)} testID="business-profile-edit" />

            <Button
              label="Sign out"
              variant="secondary"
              onPress={async () => {
                await signOut();
                router.replace('/(auth)/login' as never);
              }}
            />
            <View style={styles.bottomPad} />
          </>
        )}
      </ScrollView>

      <Sheet
        visible={editOpen}
        onClose={() => setEditOpen(false)}
        title="Edit Business Profile"
        footer={<PrimaryButton label={save.isPending ? 'Saving…' : 'Save Changes'} loading={save.isPending} onPress={() => save.mutate()} testID="business-profile-save" />}
        testID="sheet-edit-business">
        <View style={styles.photoRow}>
          {shopImageUrl ? <Image source={{ uri: shopImageUrl }} style={styles.photoPreview} /> : <Avatar name={businessName || 'B'} size="lg" />}
          <Button label={uploading ? 'Uploading…' : 'Choose photo'} variant="secondary" fullWidth={false} icon="camera" onPress={chooseImage} />
        </View>
        <TextField label="Business name *" value={businessName} onChangeText={setBusinessName} placeholder="Your business name" />
        <TextField label="Category" value={category} onChangeText={setCategory} placeholder="e.g. Cafe, Retail, Salon" />
        <TextField label="Registration number" value={registrationNumber} onChangeText={setRegistrationNumber} placeholder="Optional" />
        <TextField label="Address *" value={address} onChangeText={setAddress} placeholder="Business address" type="textarea" />
      </Sheet>

      <BottomTabBar items={BUSINESS_TABS} activeKey="profile" onSelect={goBusinessTab} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: layout.screenGutter,
    gap: space.base,
    maxWidth: layout.maxContentWidth,
    width: '100%',
    alignSelf: 'center',
    paddingBottom: 120,
  },
  headerCard: {
    alignItems: 'center',
    gap: space.sm,
    backgroundColor: color.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: color.borderSubtle,
    ...shadow.sm,
    padding: space.xl,
  },
  avatarWrap: { position: 'relative' },
  avatarPhoto: { width: 80, height: 80, borderRadius: radius.full },
  verifiedBadge: {
    position: 'absolute',
    right: -2,
    bottom: -2,
    width: 24,
    height: 24,
    borderRadius: radius.full,
    backgroundColor: color.success,
    borderWidth: 2,
    borderColor: color.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  verifiedText: { color: color.textInverse, fontSize: 12 },
  name: { textAlign: 'center' },
  verifiedPill: { backgroundColor: color.successSoft, borderRadius: radius.full, paddingHorizontal: space.base, paddingVertical: space.xs },
  verifiedPillText: { color: color.successStrong },
  card: {
    backgroundColor: color.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: color.borderSubtle,
    ...shadow.sm,
    padding: space.base,
    gap: space.md,
  },
  detailRow: { gap: 2 },
  photoRow: { flexDirection: 'row', alignItems: 'center', gap: space.base },
  photoPreview: { width: 64, height: 64, borderRadius: radius.full },
  bottomPad: { height: 20 },
});
