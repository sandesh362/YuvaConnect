import * as ImagePicker from 'expo-image-picker';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, colors, Field, ImagePreview, VerificationBadge } from '@/components/ui';
import { apiErrorMessage } from '@/config/api';
import { getProfile, updateProfile, uploadImage } from '@/lib/profile-api';
import { useAuth } from '@/providers/auth-provider';
import { BusinessProfile } from '@/types/api';

export default function BusinessProfileScreen() {
  const { token } = useAuth(); const client = useQueryClient(); const query = useQuery({ queryKey: ['profile'], queryFn: () => getProfile(token!), enabled: !!token }); const profile = query.data?.profile as BusinessProfile | null | undefined;
  const [businessName, setBusinessName] = useState(''); const [category, setCategory] = useState(''); const [registrationNumber, setRegistrationNumber] = useState(''); const [address, setAddress] = useState(''); const [shopImageUrl, setShopImageUrl] = useState<string | null>(null);
  useEffect(() => { if (profile) { setBusinessName(profile.businessName); setCategory(profile.category); setRegistrationNumber(profile.registrationNumber); setAddress(profile.address); setShopImageUrl(profile.shopImageUrl); } }, [profile]);
  const save = useMutation({ mutationFn: () => updateProfile(token!, { businessName, category, registrationNumber, address, shopImageUrl }), onSuccess: () => client.invalidateQueries({ queryKey: ['profile'] }), onError: (e) => Alert.alert('Could not save profile', apiErrorMessage(e)) });
  async function pickImage(camera = false) { const permission = camera ? await ImagePicker.requestCameraPermissionsAsync() : await ImagePicker.requestMediaLibraryPermissionsAsync(); if (!permission.granted) return Alert.alert('Permission needed', 'Allow access to upload an image.'); const result = camera ? await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], quality: 0.8 }) : await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.8 }); if (result.canceled) return; try { setShopImageUrl(await uploadImage(token!, result.assets[0])); } catch (e) { Alert.alert('Upload failed', apiErrorMessage(e)); } }
  function chooseImage() { Alert.alert('Add shop photo', 'Choose a source', [{ text: 'Camera', onPress: () => void pickImage(true) }, { text: 'Photo library', onPress: () => void pickImage() }, { text: 'Cancel', style: 'cancel' }]); }
  return <SafeAreaView style={styles.safe}><ScrollView contentContainerStyle={styles.content}><View style={styles.top}><Pressable onPress={() => router.back()}><Text style={styles.back}>‹ Back</Text></Pressable><Text style={styles.heading}>Business profile</Text><VerificationBadge verified={profile?.isVerified ?? false} /></View><View style={styles.card}><ImagePreview uri={shopImageUrl} label="Shop photo" /><Button title="Choose shop photo" variant="outline" onPress={chooseImage} /></View><View style={styles.card}><Field label="Business name" value={businessName} onChangeText={setBusinessName} placeholder="Your business name" /><Field label="Category" value={category} onChangeText={setCategory} placeholder="e.g. Cafe, Retail, Salon" /><Field label="Registration number" value={registrationNumber} onChangeText={setRegistrationNumber} placeholder="Optional registration number" /><Field label="Address" value={address} onChangeText={setAddress} multiline placeholder="Business address" /><Button title={save.isPending ? 'Saving…' : 'Save profile'} disabled={save.isPending} onPress={() => save.mutate()} /></View></ScrollView></SafeAreaView>;
}
const styles = StyleSheet.create({ safe: { flex: 1, backgroundColor: colors.pale }, content: { padding: 20, gap: 20 }, top: { gap: 10 }, back: { color: colors.blue, fontWeight: '700' }, heading: { fontSize: 28, color: colors.navy, fontWeight: '800' }, card: { backgroundColor: colors.white, borderRadius: 14, padding: 16, gap: 15, alignItems: 'flex-start' } });
