/**
 * Student Portfolio & Profile — wireframe 23/37. Rebuild in place, route unchanged.
 *
 * Route: /(student)/profile  ·  Spec: docs/wireframes/23-student-profile.md
 *
 * Data honesty:
 *  - Header, skills, rating and portfolio are the REAL StudentProfile; the
 *    green tick badge renders only when isVerified is real.
 *  - Degree/Year are NOT in the schema → the caption shows the real college
 *    only (flagged). The pin row shows the device-local location saved on
 *    screen 10 (its own screen flags the storage).
 *  - Earnings stat = real /api/earnings total; Gigs stat = real count of my
 *    applications on completed gigs; Rating = real avgRating/totalRatings.
 *  - PortfolioItem has NO category/business/amount/rating columns → cards show
 *    the real title/description/date and omit the rest (flagged, not faked).
 *  - Edit Profile is FULLY REAL: college, bio, availability and photo upload
 *    all go through PUT /api/profile (+ /api/upload). Legacy functionality
 *    preserved: portfolio add/remove and sign-out remain.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import {
  Avatar,
  BottomTabBar,
  Button,
  Icon,
  IconButton,
  InfoBanner,
  LoadingSkeleton,
  PrimaryButton,
  Screen,
  SectionHeader,
  SelectableChip,
  Sheet,
  StatBox,
  Text,
  TextField,
} from '@/components/ui';
import { STUDENT_TABS } from '@/components/ui/BottomTabBar';
import { apiErrorMessage } from '@/config/api';
import { getEarnings, getMyGigs } from '@/lib/gig-api';
import { addPortfolioItem, getProfile, removePortfolioItem, updateProfile, uploadImage } from '@/lib/profile-api';
import { goStudentTab } from '@/lib/tab-nav';
import { useAuth } from '@/providers/auth-provider';
import { color } from '@/theme/colors';
import type { IconName } from '@/theme/icons';
import { radius, shadow } from '@/theme/radius';
import { layout, space } from '@/theme/spacing';
import type { Availability, StudentProfile } from '@/types/api';

const LOC_KEY = 'yuvaconnect:location-availability';
const COMPLETED = ['APPROVED', 'PAID', 'CLOSED'];

const availabilityLabels: Record<Availability, string> = {
  FULL_TIME_AVAILABLE: 'Full-time',
  PART_TIME: 'Part-time',
  WEEKENDS_ONLY: 'Weekends only',
};

function skillIcon(skill: string): IconName {
  const text = skill.toLowerCase();
  if (/(design|graphic|canva)/.test(text)) return 'brush';
  if (/(social|influencer)/.test(text)) return 'megaphone';
  if (/(ui|ux)/.test(text)) return 'palette';
  if (/(writ|content|seo)/.test(text)) return 'pen';
  if (/(photo|camera)/.test(text)) return 'camera';
  if (/(video|motion|edit)/.test(text)) return 'film';
  if (/(web|app|code|develop|python|shopify|flutter|data)/.test(text)) return 'code';
  if (/(market|sales|ad)/.test(text)) return 'trendUp';
  return 'sparkles';
}

export default function StudentProfileScreen() {
  const { token, user, signOut } = useAuth();
  const client = useQueryClient();
  const [location, setLocation] = useState('');

  const [editOpen, setEditOpen] = useState(false);
  const [college, setCollege] = useState('');
  const [bio, setBio] = useState('');
  const [availability, setAvailability] = useState<Availability>('PART_TIME');
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [photoUploading, setPhotoUploading] = useState(false);

  const [addOpen, setAddOpen] = useState(false);
  const [itemTitle, setItemTitle] = useState('');
  const [itemDescription, setItemDescription] = useState('');
  const [itemImage, setItemImage] = useState<string | null>(null);

  const profileQuery = useQuery({ queryKey: ['profile'], queryFn: () => getProfile(token!), enabled: !!token });
  const earningsQuery = useQuery({ queryKey: ['earnings'], queryFn: () => getEarnings(token!), enabled: !!token });
  const myGigsQuery = useQuery({ queryKey: ['my-gigs'], queryFn: () => getMyGigs(token!), enabled: !!token });

  const profile = profileQuery.data?.profile && 'skills' in profileQuery.data.profile ? (profileQuery.data.profile as StudentProfile) : null;

  useEffect(() => {
    AsyncStorage.getItem(LOC_KEY)
      .then((raw) => raw && setLocation((JSON.parse(raw) as { location?: string }).location ?? ''))
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    if (profile) {
      setCollege(profile.college ?? '');
      setBio(profile.bio ?? '');
      setAvailability(profile.availability ?? 'PART_TIME');
      setPhotoUrl(profile.profileImageUrl);
    }
  }, [profile]);

  const completedGigs = useMemo(
    () => (myGigsQuery.data?.applications ?? []).filter((application) => application.gig && COMPLETED.includes(application.gig.status)).length,
    [myGigsQuery.data],
  );

  const refreshProfile = () => {
    client.invalidateQueries({ queryKey: ['profile'] });
    client.invalidateQueries({ queryKey: ['me'] });
  };

  const pickPhoto = async () => {
    if (!token) return;
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'] as never, quality: 0.7 });
    if (result.canceled) return;
    setPhotoUploading(true);
    try {
      setPhotoUrl(await uploadImage(token, result.assets[0] as ImagePicker.ImagePickerAsset));
    } finally {
      setPhotoUploading(false);
    }
  };

  const saveProfile = useMutation({
    mutationFn: () => updateProfile(token!, { college: college.trim(), bio: bio.trim(), availability, ...(photoUrl ? { profileImageUrl: photoUrl } : {}) }),
    onSuccess: () => {
      setEditOpen(false);
      refreshProfile();
    },
  });

  const addItem = useMutation({
    mutationFn: () => addPortfolioItem(token!, { title: itemTitle.trim(), description: itemDescription.trim() || undefined, imageUrl: itemImage }),
    onSuccess: () => {
      setAddOpen(false);
      setItemTitle('');
      setItemDescription('');
      setItemImage(null);
      refreshProfile();
    },
  });

  const removeItem = useMutation({
    mutationFn: (id: string) => removePortfolioItem(token!, id),
    onSuccess: refreshProfile,
  });

  const pickItemImage = async () => {
    if (!token) return;
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'] as never, quality: 0.8 });
    if (result.canceled) return;
    setItemImage(await uploadImage(token, result.assets[0] as ImagePicker.ImagePickerAsset));
  };

  return (
    <Screen testID="screen-profile">
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {!token ? (
          <InfoBanner tone="info" icon="info" title="Login required" description="Login to view and edit your profile." />
        ) : profileQuery.isLoading ? (
          <LoadingSkeleton count={3} variant="card" />
        ) : (
          <>
            {/* --- Header card --- */}
            <View style={styles.headerCard}>
              <View style={styles.avatarWrap}>
                {photoUrl ? <Image source={{ uri: photoUrl }} style={styles.avatarPhoto} /> : <Avatar name={user?.name ?? 'Student'} size="xl" tone={color.primarySoft} />}
                {profile?.isVerified ? (
                  <View style={styles.verifiedBadge}>
                    <Icon name="check" size={13} color={color.textInverse} />
                  </View>
                ) : null}
              </View>
              <Text variant="title1" style={styles.name}>
                {user?.name ?? '—'}
              </Text>
              {profile?.college ? (
                <Text variant="caption" tone="secondary">
                  {profile.college}
                </Text>
              ) : null}
              {location ? (
                <View style={styles.pinRow}>
                  <Icon name="mapPinFilled" size={13} color={color.textSecondary} />
                  <Text variant="caption" tone="secondary">
                    {location}
                  </Text>
                </View>
              ) : null}
            </View>

            {/* --- Stats --- */}
            <View style={styles.statRow}>
              <StatBox variant="tinted" icon="wallet" tone="brand" label="Earnings" value={`₹${Number(earningsQuery.data?.total ?? 0).toLocaleString()}`} style={styles.statCell} />
              <StatBox variant="tinted" icon="checkCircleFilled" tone="success" label="Gigs" value={String(completedGigs)} style={styles.statCell} />
              <Pressable accessibilityRole="button" accessibilityLabel="View reviews and ratings" onPress={() => router.push('/reviews' as never)} style={styles.statCell}>
                <StatBox
                  variant="tinted"
                  icon="starFilled"
                  tone="warning"
                  label="Rating"
                  value={profile && profile.totalRatings > 0 ? `${profile.avgRating.toFixed(1)}/5` : '—'}
                />
              </Pressable>
            </View>

            <Button label="Edit Profile" variant="secondary" icon="pen" onPress={() => setEditOpen(true)} testID="profile-edit" />

            {/* --- Verified skills --- */}
            <View style={styles.section}>
              <SectionHeader title="Verified Skills" />
              {profile?.skills.length ? (
                <View style={styles.skillWrap}>
                  {profile.skills.map((skill) => (
                    <View key={skill} style={styles.skillPill}>
                      <View style={styles.skillIcon}>
                        <Icon name={skillIcon(skill)} size={13} color={color.textInverse} />
                      </View>
                      <Text variant="captionStrong" style={styles.skillLabel}>
                        {skill}
                      </Text>
                    </View>
                  ))}
                </View>
              ) : (
                <Text variant="callout" tone="tertiary">
                  No skills saved yet — add them on the Skill Selection screen.
                </Text>
              )}
            </View>

            {/* --- Portfolio --- */}
            <View style={styles.section}>
              <SectionHeader title="Work Portfolio" actionLabel={`${profile?.portfolioItems.length ?? 0} Items`} />
              {profile?.portfolioItems.length ? (
                profile.portfolioItems.map((item) => (
                  <View key={item.id} style={styles.portfolioCard}>
                    {item.imageUrl ? <Image source={{ uri: item.imageUrl }} style={styles.portfolioImage} /> : null}
                    <View style={styles.portfolioCopy}>
                      <Text variant="title3" numberOfLines={1}>
                        {item.title}
                      </Text>
                      {item.description ? (
                        <Text variant="caption" tone="secondary" numberOfLines={2}>
                          {item.description}
                        </Text>
                      ) : null}
                      <Text variant="caption" tone="tertiary">
                        {new Date(item.createdAt).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
                      </Text>
                    </View>
                    <IconButton
                      name="trash"
                      accessibilityLabel={`Remove ${item.title}`}
                      onPress={() => removeItem.mutate(item.id)}
                    />
                  </View>
                ))
              ) : (
                <Text variant="callout" tone="tertiary">
                  No portfolio items yet — add your best work below.
                </Text>
              )}
              <Button label="Add portfolio item" variant="secondary" icon="addCircle" onPress={() => setAddOpen(true)} />
              <InfoBanner
                tone="info"
                icon="info"
                title="Portfolio cards show real fields only"
                description="PortfolioItem stores title, description, image and date — the category, business, amount and star pill in the wireframe have no columns, so they are omitted rather than invented."
              />
            </View>

            {saveProfile.isError ? <InfoBanner tone="danger" icon="offline" title="Could not save profile" description={apiErrorMessage(saveProfile.error)} /> : null}

            <Button
              label="Sign out"
              variant="secondary"
              onPress={async () => {
                await signOut();
                router.replace('/login' as never);
              }}
            />
          </>
        )}
      </ScrollView>

      {/* --- Edit profile sheet: fully real --- */}
      <Sheet
        visible={editOpen}
        onClose={() => setEditOpen(false)}
        title="Edit Profile"
        footer={
          <PrimaryButton
            label={saveProfile.isPending ? 'Saving…' : 'Save Changes'}
            onPress={() => saveProfile.mutate()}
            testID="profile-save"
          />
        }
        testID="sheet-edit-profile">
        <View style={styles.photoRow}>
          {photoUrl ? <Image source={{ uri: photoUrl }} style={styles.photoPreview} /> : <Avatar name={user?.name ?? 'S'} size="lg" />}
          <Button label={photoUploading ? 'Uploading…' : 'Change photo'} variant="secondary" fullWidth={false} icon="camera" onPress={pickPhoto} />
        </View>
        <TextField label="College" icon="bookmark" value={college} onChangeText={setCollege} placeholder="Your college" />
        <TextField label="Bio" value={bio} onChangeText={setBio} placeholder="A line about you" type="textarea" />
        <Text variant="label" tone="secondary">
          Availability
        </Text>
        <View style={styles.availabilityRow}>
          {(Object.keys(availabilityLabels) as Availability[]).map((option) => (
            <SelectableChip key={option} label={availabilityLabels[option]} selected={availability === option} indicator="none" onToggle={() => setAvailability(option)} />
          ))}
        </View>
      </Sheet>

      {/* --- Add portfolio item sheet (legacy functionality preserved) --- */}
      <Sheet
        visible={addOpen}
        onClose={() => setAddOpen(false)}
        title="Add Portfolio Item"
        footer={
          <PrimaryButton
            label={addItem.isPending ? 'Adding…' : 'Add Item'}
            disabled={!itemTitle.trim()}
            onPress={() => addItem.mutate()}
          />
        }
        testID="sheet-add-portfolio">
        <TextField label="Title" value={itemTitle} onChangeText={setItemTitle} placeholder="e.g. Festival poster series" />
        <TextField label="Description" value={itemDescription} onChangeText={setItemDescription} placeholder="What was the work about?" type="textarea" />
        <Button label={itemImage ? 'Replace image' : 'Attach image'} variant="secondary" icon="image" onPress={pickItemImage} />
        {itemImage ? (
          <Text variant="caption" tone="secondary" numberOfLines={1}>
            {itemImage}
          </Text>
        ) : null}
        {addItem.isError ? <InfoBanner tone="danger" icon="offline" title="Could not add item" description={apiErrorMessage(addItem.error)} /> : null}
      </Sheet>

      <BottomTabBar items={STUDENT_TABS} activeKey="profile" onSelect={goStudentTab} />
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
    paddingBottom: space['2xl'],
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
  name: { textAlign: 'center' },
  pinRow: { flexDirection: 'row', alignItems: 'center', gap: space.xs },

  statRow: { flexDirection: 'row', gap: space.md },
  statCell: { flex: 1 },

  section: { gap: space.md, marginTop: space.md },
  skillWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: space.md },
  skillPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    backgroundColor: color.surface,
    borderWidth: 1,
    borderColor: color.borderSubtle,
    borderRadius: radius.full,
    paddingLeft: space.xs,
    paddingRight: space.base,
    paddingVertical: space.xs,
  },
  skillIcon: {
    width: 24,
    height: 24,
    borderRadius: radius.full,
    backgroundColor: color.textPrimary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  skillLabel: { color: color.textPrimary },

  portfolioCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    backgroundColor: color.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: color.borderSubtle,
    ...shadow.sm,
    padding: space.base,
  },
  portfolioImage: { width: 56, height: 56, borderRadius: radius.md },
  portfolioCopy: { flex: 1, gap: 2 },

  photoRow: { flexDirection: 'row', alignItems: 'center', gap: space.base },
  photoPreview: { width: 64, height: 64, borderRadius: radius.full },
  availabilityRow: { flexDirection: 'row', flexWrap: 'wrap', gap: space.md },
});
