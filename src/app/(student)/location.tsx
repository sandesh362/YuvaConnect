/**
 * Student Location & Availability — wireframe 10/37 (Step 4 of 5).
 *
 * Route: /location (new, additive). Spec: docs/wireframes/10-location-availability.md
 *
 * Data honesty:
 *  - StudentProfile has NO location / radius / work-preference / weekday
 *    columns. Everything on this screen is therefore stored device-local
 *    (AsyncStorage) behind one explanatory InfoBanner — the same treatment
 *    screen 8 uses — and is never presented as server data.
 *  - The embedded map has no geo data and no map library (approved pilot
 *    decision): it is replaced by a text location treatment + flag, not a
 *    fake map image.
 *  - "Current Location" never shows a hardcoded place: it shows the stored
 *    value or "Tap to set", and tapping reveals a real editable field.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import {
  BottomActionBar,
  Button,
  Icon,
  InfoBanner,
  Screen,
  ScreenHeader,
  SelectTile,
  Slider,
  StepProgress,
  Text,
  TextField,
} from '@/components/ui';
import { color } from '@/theme/colors';
import { radius, shadow } from '@/theme/radius';
import { layout, space } from '@/theme/spacing';

const STORE_KEY = 'yuvaconnect:location-availability';
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

type Stored = {
  location: string;
  radiusKm: number;
  preference: 'on-site' | 'remote';
  days: string[];
};

const DEFAULTS: Stored = { location: '', radiusKm: 15, preference: 'on-site', days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'] };

function DayCircle({ label, selected, onToggle }: { label: string; selected: boolean; onToggle: () => void }) {
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityLabel={label}
      accessibilityState={{ checked: selected }}
      onPress={onToggle}
      style={[styles.day, selected && styles.daySelected]}>
      <Text variant="calloutStrong" style={selected ? styles.dayLabelSelected : styles.dayLabel}>
        {label}
      </Text>
    </Pressable>
  );
}

export default function LocationAvailabilityScreen() {
  const [state, setState] = useState<Stored>(DEFAULTS);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORE_KEY)
      .then((raw) => raw && setState({ ...DEFAULTS, ...(JSON.parse(raw) as Stored) }))
      .catch(() => undefined);
  }, []);

  const save = async () => {
    setSaving(true);
    try {
      await AsyncStorage.setItem(STORE_KEY, JSON.stringify(state));
      setSaved(true);
      router.replace('/home' as never);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Screen testID="screen-location">
      <ScreenHeader title="Location & Availability" subtitle="Step 4 of 5" onBack={() => router.back()} />
      <StepProgress total={5} current={4} style={styles.steps} />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <View style={styles.intro}>
          <Text variant="title1">Work Location</Text>
          <Text variant="body" tone="secondary">
            Where do you want to find gigs?
          </Text>
        </View>

        {/* --- Current location row (real stored value, editable) --- */}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Edit current location"
          onPress={() => setEditing((value) => !value)}
          style={styles.locationCard}>
          <View style={styles.locationWell}>
            <Icon name="locate" size={22} color={color.primaryText} />
          </View>
          <View style={styles.locationCopy}>
            <Text variant="captionStrong" tone="secondary">
              Current Location
            </Text>
            <Text variant="calloutStrong" numberOfLines={1}>
              {state.location || 'Tap to set your location'}
            </Text>
          </View>
          <Icon name="chevronRight" size={18} color={color.textPrimary} />
        </Pressable>
        {editing ? (
          <TextField
            label="Your area"
            icon="mapPin"
            value={state.location}
            onChangeText={(value) => setState((current) => ({ ...current, location: value }))}
            placeholder="e.g. Powai, Mumbai, Maharashtra"
            testID="location-input"
          />
        ) : null}

        {/* --- Map replaced by the approved text-only pilot treatment --- */}
        <InfoBanner
          tone="info"
          icon="mapPin"
          title="Map view arrives with geo support"
          description={`The pilot shows your radius as text: gigs within ${state.radiusKm} km of “${state.location || 'your area'}”. No fake map is rendered.`}
        />

        {/* --- Radius --- */}
        <View style={styles.radiusHead}>
          <Text variant="title2">Work Radius</Text>
          <Text variant="title3" tone="brand">
            {state.radiusKm} km
          </Text>
        </View>
        <View style={styles.radiusBlock}>
          <Text variant="bodyStrong">Distance</Text>
          <Slider
            value={state.radiusKm}
            min={1}
            max={30}
            step={1}
            onValueChange={(value) => setState((current) => ({ ...current, radiusKm: value }))}
            testID="location-radius"
          />
        </View>

        {/* --- Work preference --- */}
        <View style={styles.block}>
          <Text variant="title2">Work Preference</Text>
          <Text variant="body" tone="secondary">
            Choose how you prefer to work
          </Text>
          <View style={styles.prefRow} accessibilityRole="radiogroup" accessibilityLabel="Work preference">
            <SelectTile
              label="On-site"
              icon="storefront"
              iconColor={state.preference === 'on-site' ? color.primary : color.textSecondary}
              selected={state.preference === 'on-site'}
              onPress={() => setState((current) => ({ ...current, preference: 'on-site' }))}
              align="center"
              height={96}
              style={styles.prefTile}
            />
            <SelectTile
              label="Remote"
              icon="laptop"
              iconColor={state.preference === 'remote' ? color.primary : color.textSecondary}
              selected={state.preference === 'remote'}
              onPress={() => setState((current) => ({ ...current, preference: 'remote' }))}
              align="center"
              height={96}
              style={styles.prefTile}
            />
          </View>
        </View>

        {/* --- Availability --- */}
        <View style={styles.block}>
          <Text variant="title2">Availability</Text>
          <Text variant="body" tone="secondary">
            When are you free to take up gigs?
          </Text>
          <View style={styles.daysRow} accessibilityLabel="Available days">
            {DAYS.map((day) => (
              <DayCircle
                key={day}
                label={day}
                selected={state.days.includes(day)}
                onToggle={() =>
                  setState((current) => ({
                    ...current,
                    days: current.days.includes(day) ? current.days.filter((item) => item !== day) : [...current.days, day],
                  }))
                }
              />
            ))}
          </View>
          <View style={styles.hintRow}>
            <Icon name="info" size={18} color={color.textSecondary} />
            <Text variant="callout" tone="secondary" style={styles.hintCopy}>
              Most MSMEs prefer students available for at least 4 hours on selected days.
            </Text>
          </View>
        </View>

        <InfoBanner
          tone="info"
          icon="info"
          title="Stored on this device for the pilot"
          description="StudentProfile has no location, radius, preference or weekday columns yet, so these settings live in AsyncStorage until the backend gains them. Flagged, not faked."
        />
        {saved ? <InfoBanner tone="success" icon="checkCircleFilled" title="Saved" /> : null}
      </ScrollView>

      <BottomActionBar>
        <Button
          label="Save & Continue"
          iconRight="arrowForward"
          size="lg"
          loading={saving}
          onPress={save}
          testID="location-save"
        />
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

  locationCard: {
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
  locationWell: {
    width: 48,
    height: 48,
    borderRadius: radius.full,
    backgroundColor: color.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  locationCopy: { flex: 1, gap: 2 },

  radiusHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  radiusBlock: { gap: space.md, marginTop: -space.md },

  block: { gap: space.md },
  prefRow: { flexDirection: 'row', gap: space.md },
  prefTile: { flex: 1 },

  daysRow: { flexDirection: 'row', flexWrap: 'wrap', gap: space.md },
  day: {
    width: 52,
    height: 52,
    borderRadius: radius.full,
    backgroundColor: color.surface,
    borderWidth: 1,
    borderColor: color.borderSubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  daySelected: { backgroundColor: color.primary, borderColor: color.primary },
  dayLabel: { color: color.textSecondary },
  dayLabelSelected: { color: color.textInverse },

  hintRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    backgroundColor: color.surfaceMuted,
    borderRadius: radius.md,
    paddingHorizontal: space.base,
    paddingVertical: space.md,
  },
  hintCopy: { flex: 1, lineHeight: 20 },
});
