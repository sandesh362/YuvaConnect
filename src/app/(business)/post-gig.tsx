/**
 * Post a New Gig — wireframe 28/37. Rebuild in place, route unchanged.
 *
 * Route: /(business)/post-gig  ·  Spec: docs/wireframes/28-post-a-gig.md
 *
 * What is REAL: POST /api/gigs with title, description, skillsRequired[],
 * budget (number), deadline (Date) and location — every required column the
 * live controller validates. On success: invalidate + deep-link to the real
 * gig detail route.
 *
 * Flags (never faked):
 *  - Category, Payment type, Duration and the Deliverables list have NO gig
 *    columns. They are kept in the UI per the wireframe and composed into the
 *    description text under a labelled "---" block at publish time (same
 *    approved treatment as Est. Days/Portfolio → proposal on screen 15). A
 *    banner states this before publishing.
 *  - "Save Draft": GigStatus has no DRAFT value — a gig is published or it
 *    does not exist. Tapping raises the flag banner, nothing fake is stored.
 *  - Work mode maps to the real `location` column: On-site uses the business
 *    profile address when set; Remote stores "Remote".
 *  - "Review & Publish" opens a real review Sheet summarising exactly what
 *    will be sent before the POST fires.
 */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import {
  Button,
  FloatingLabelSelect,
  IconButton,
  Icon,
  InfoBanner,
  RadioRow,
  Screen,
  SelectableChip,
  Sheet,
  StepProgress,
  Text,
  TextField,
  TextLink,
} from '@/components/ui';
import { apiErrorMessage } from '@/config/api';
import { createGig } from '@/lib/gig-api';
import { getProfile } from '@/lib/profile-api';
import { useAuth } from '@/providers/auth-provider';
import { color } from '@/theme/colors';
import { radius, shadow } from '@/theme/radius';
import { layout, space } from '@/theme/spacing';

const SUGGESTED_SKILLS = [
  'Product Photography',
  'Adobe Lightroom',
  'Mobile Photography',
  'Food Styling',
  'Photo Editing',
  'Social Media',
  'Content Writing',
  'Data Entry',
];

const CATEGORIES = [
  'Photography',
  'Food & Restaurant',
  'Retail & Shop',
  'Digital Services',
  'Education & Coaching',
  'Events & Media',
  'Salon & Wellness',
  'Logistics & Delivery',
  'Other',
];

const PAYMENT_TYPES = ['Fixed Price', 'Hourly'];

const DEADLINE_PRESETS = [
  { label: '3 Days', days: 3 },
  { label: '1 Week', days: 7 },
  { label: '2 Weeks', days: 14 },
  { label: '1 Month', days: 30 },
];

function isoInDays(days: number): string {
  const date = new Date(Date.now() + days * 86400000);
  return date.toISOString().slice(0, 10);
}

function prettyDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function PostGigScreen() {
  const { token } = useAuth();
  const client = useQueryClient();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [skills, setSkills] = useState<string[]>([]);
  const [customSkill, setCustomSkill] = useState('');
  const [workMode, setWorkMode] = useState<'onsite' | 'remote'>('onsite');
  const [budget, setBudget] = useState('');
  const [paymentType, setPaymentType] = useState('Fixed Price');
  const [deadline, setDeadline] = useState(isoInDays(7));
  const [customDeadline, setCustomDeadline] = useState('');
  const [duration, setDuration] = useState('');
  const [deliverables, setDeliverables] = useState<string[]>([]);
  const [deliverableDraft, setDeliverableDraft] = useState('');

  const [sheet, setSheet] = useState<null | 'category' | 'payment' | 'deadline' | 'skill' | 'deliverable' | 'review'>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const profileQuery = useQuery({
    queryKey: ['profile', token],
    queryFn: () => getProfile(token!),
    enabled: !!token,
  });

  useEffect(() => {
    const profile = profileQuery.data?.profile;
    if (profile && 'category' in profile && profile.category && !category) setCategory(profile.category);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profileQuery.data]);

  const publish = useMutation({
    mutationFn: () => {
      const profile = profileQuery.data?.profile;
      const address = profile && 'address' in profile ? profile.address : '';
      const extras = [
        category ? `Category: ${category}` : null,
        `Payment type: ${paymentType}`,
        duration.trim() ? `Duration: ${duration.trim()}` : null,
        `Work mode: ${workMode === 'onsite' ? 'On-site' : 'Remote'}`,
        deliverables.length ? `Deliverables:\n${deliverables.map((item) => `- ${item}`).join('\n')}` : null,
      ].filter(Boolean);
      const finalDescription = extras.length ? `${description.trim()}\n\n---\n${extras.join('\n')}` : description.trim();
      return createGig(token!, {
        title: title.trim(),
        description: finalDescription,
        skillsRequired: skills,
        budget: Number(budget),
        deadline: new Date(deadline).toISOString(),
        location: workMode === 'onsite' ? address.trim() || 'On-site' : 'Remote',
      });
    },
    onSuccess: (gig) => {
      client.invalidateQueries({ queryKey: ['my-gigs'] });
      client.invalidateQueries({ queryKey: ['gigs'] });
      router.replace(`/(business)/gig/${gig.id}` as never);
    },
    onError: (err) => setError(apiErrorMessage(err)),
  });

  const canPublish = title.trim().length > 0 && description.trim().length > 0 && Number(budget) > 0 && !Number.isNaN(new Date(deadline).getTime());

  const toggleSkill = (skill: string) =>
    setSkills((current) => (current.includes(skill) ? current.filter((item) => item !== skill) : [...current, skill]));

  const addCustomSkill = () => {
    const skill = customSkill.trim();
    if (skill && !skills.includes(skill)) setSkills((current) => [...current, skill]);
    if (skill && !SUGGESTED_SKILLS.includes(skill)) SUGGESTED_SKILLS.unshift(skill);
    setCustomSkill('');
    setSheet(null);
  };

  const addDeliverable = () => {
    const item = deliverableDraft.trim();
    if (item) setDeliverables((current) => [...current, item]);
    setDeliverableDraft('');
    setSheet(null);
  };

  return (
    <Screen testID="screen-post-gig">
      {/* Sheet-like header: X · 4-segment step bar · Save Draft */}
      <View style={styles.header}>
        <IconButton name="close" variant="plain" accessibilityLabel="Close" onPress={() => router.back()} testID="post-gig-close" />
        <StepProgress total={4} current={1} style={styles.headerSteps} />
        <TextLink
          label="Save Draft"
          iconRight={null}
          onPress={() =>
            setNotice('GigStatus has no DRAFT value — a gig is published or it does not exist. Nothing was stored. Flagged, not faked.')
          }
        />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        {/* --- Basic details --- */}
        <Text variant="title2">Basic Details</Text>
        <Text variant="body" tone="secondary">
          Clearly describe the task to attract the right students.
        </Text>

        <TextField label="Gig Title" value={title} onChangeText={setTitle} placeholder="e.g. Product Photography for Bakery" testID="post-gig-title" />
        <FloatingLabelSelect label="Category" value={category} placeholder="Select category" onPress={() => setSheet('category')} testID="post-gig-category" />
        <TextField
          label="Description"
          type="textarea"
          value={description}
          onChangeText={setDescription}
          placeholder="Looking for a student to take 15 high-quality product photos…"
          testID="post-gig-description"
        />

        <View style={styles.divider} />

        {/* --- Skills & requirements --- */}
        <Text variant="title2">Skills & Requirements</Text>
        <Text variant="body" tone="secondary">
          What expertise does the student need?
        </Text>
        <Text variant="label" tone="secondary">
          Required Skills
        </Text>
        <View style={styles.chipWrap}>
          {SUGGESTED_SKILLS.map((skill) => (
            <SelectableChip key={skill} label={skill} selectedStyle="soft" indicator="check" selected={skills.includes(skill)} onToggle={() => toggleSkill(skill)} />
          ))}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Add Skill"
            onPress={() => setSheet('skill')}
            style={({ pressed }) => [styles.addChip, pressed && styles.pressed]}
            testID="post-gig-add-skill">
            <Text variant="callout" style={styles.addChipLabel}>
              Add Skill +
            </Text>
          </Pressable>
        </View>

        {/* Work mode — maps to the real `location` column */}
        <View style={styles.radioRow}>
          <Pressable
            accessibilityRole="radio"
            accessibilityLabel="On-site, at your business"
            accessibilityState={{ selected: workMode === 'onsite' }}
            onPress={() => setWorkMode('onsite')}
            style={[styles.radioCard, workMode === 'onsite' && styles.radioCardOn]}
            testID="post-gig-onsite">
            <View style={[styles.radioDot, workMode === 'onsite' && styles.radioDotOn]} />
            <View style={styles.radioText}>
              <Text variant="bodyStrong">On-site</Text>
              <Text variant="caption" tone="tertiary">
                At your business
              </Text>
            </View>
          </Pressable>
          <Pressable
            accessibilityRole="radio"
            accessibilityLabel="Remote, work from home"
            accessibilityState={{ selected: workMode === 'remote' }}
            onPress={() => setWorkMode('remote')}
            style={[styles.radioCard, workMode === 'remote' && styles.radioCardOn]}
            testID="post-gig-remote">
            <View style={[styles.radioDot, workMode === 'remote' && styles.radioDotOn]} />
            <View style={styles.radioText}>
              <Text variant="bodyStrong">Remote</Text>
              <Text variant="caption" tone="tertiary">
                Work from home
              </Text>
            </View>
          </Pressable>
        </View>

        <View style={styles.divider} />

        {/* --- Budget & timeline --- */}
        <Text variant="title2">Budget & Timeline</Text>
        <Text variant="body" tone="secondary">
          Define the compensation and deadlines.
        </Text>
        <View style={styles.twoCol}>
          <TextField
            label="Budget (₹)"
            icon="wallet"
            value={budget}
            onChangeText={setBudget}
            placeholder="2500"
            keyboardType="number-pad"
            style={styles.col}
            testID="post-gig-budget"
          />
          <FloatingLabelSelect label="Payment type" value={paymentType} onPress={() => setSheet('payment')} style={styles.colSelect} testID="post-gig-payment" />
        </View>
        <View style={styles.twoCol}>
          <FloatingLabelSelect label="Deadline" value={prettyDate(deadline)} icon="calendar" onPress={() => setSheet('deadline')} style={styles.colSelect} testID="post-gig-deadline" />
          <TextField
            label="Duration"
            icon="stopwatch"
            value={duration}
            onChangeText={setDuration}
            placeholder="3 Days"
            style={styles.col}
            testID="post-gig-duration"
          />
        </View>

        <View style={styles.divider} />

        {/* --- Deliverables --- */}
        <Text variant="title2">Deliverables</Text>
        <Text variant="body" tone="secondary">
          List exactly what the student must submit.
        </Text>
        {deliverables.length > 0 ? (
          <View style={styles.deliverablesCard}>
            {deliverables.map((item, index) => (
              <View key={`${item}-${index}`} style={[styles.deliverableRow, index > 0 && styles.deliverableDivider]}>
                <Icon name="checkCircleFilled" size={20} color={color.textPrimary} />
                <Text variant="body" style={styles.deliverableText}>
                  {item}
                </Text>
                <IconButton
                  name="trash"
                  variant="plain"
                  color={color.danger}
                  accessibilityLabel={`Remove ${item}`}
                  onPress={() => setDeliverables((current) => current.filter((_, i) => i !== index))}
                />
              </View>
            ))}
          </View>
        ) : null}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Add Deliverable"
          onPress={() => setSheet('deliverable')}
          style={({ pressed }) => [styles.addChip, pressed && styles.pressed]}
          testID="post-gig-add-deliverable">
          <Text variant="callout" style={styles.addChipLabel}>
            Add Deliverable +
          </Text>
        </Pressable>

        <InfoBanner
          tone="info"
          icon="info"
          title="Flagged, not faked"
          description="Title, description, skills, budget, deadline and work-mode location save to real Gig columns. Category, payment type, duration and deliverables have no columns — at publish they are appended to the description under a labelled block. Save Draft has no DRAFT status behind it."
        />
        {notice ? <InfoBanner tone="warning" icon="info" title="Save Draft" description={notice} /> : null}
        {error ? <InfoBanner tone="danger" icon="offline" title="Could not publish" description={error} /> : null}

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Sticky publish bar */}
      <View style={styles.stickyBar}>
        <Button label="Review & Publish" size="lg" disabled={!canPublish} onPress={() => setSheet('review')} style={styles.publishBtn} testID="post-gig-review" />
      </View>

      {/* --- Sheets --- */}
      <Sheet visible={sheet === 'category'} onClose={() => setSheet(null)} title="Category">
        {CATEGORIES.map((item) => (
          <RadioRow
            key={item}
            label={item}
            selected={category === item}
            onPress={() => {
              setCategory(item);
              setSheet(null);
            }}
          />
        ))}
      </Sheet>

      <Sheet visible={sheet === 'payment'} onClose={() => setSheet(null)} title="Payment type">
        {PAYMENT_TYPES.map((item) => (
          <RadioRow
            key={item}
            label={item}
            description={item === 'Fixed Price' ? 'One agreed amount, held in escrow' : 'Paid per hour of tracked work'}
            selected={paymentType === item}
            onPress={() => {
              setPaymentType(item);
              setSheet(null);
            }}
          />
        ))}
      </Sheet>

      <Sheet visible={sheet === 'deadline'} onClose={() => setSheet(null)} title="Deadline">
        {DEADLINE_PRESETS.map((preset) => (
          <RadioRow
            key={preset.label}
            label={preset.label}
            description={prettyDate(isoInDays(preset.days))}
            selected={deadline === isoInDays(preset.days)}
            onPress={() => {
              setDeadline(isoInDays(preset.days));
              setSheet(null);
            }}
          />
        ))}
        <TextField
          label="Custom date"
          icon="calendar"
          value={customDeadline}
          onChangeText={setCustomDeadline}
          placeholder="YYYY-MM-DD"
          autoCapitalize="none"
        />
        <Button
          label="Use custom date"
          variant="secondary"
          disabled={Number.isNaN(new Date(customDeadline).getTime()) || !customDeadline.trim()}
          onPress={() => {
            setDeadline(new Date(customDeadline.trim()).toISOString().slice(0, 10));
            setSheet(null);
          }}
        />
      </Sheet>

      <Sheet visible={sheet === 'skill'} onClose={() => setSheet(null)} title="Add Skill">
        <TextField label="Skill" value={customSkill} onChangeText={setCustomSkill} placeholder="e.g. Adobe Lightroom" />
        <Button label="Add Skill" disabled={!customSkill.trim()} onPress={addCustomSkill} />
      </Sheet>

      <Sheet visible={sheet === 'deliverable'} onClose={() => setSheet(null)} title="Add Deliverable">
        <TextField label="Deliverable" value={deliverableDraft} onChangeText={setDeliverableDraft} placeholder="e.g. 15 High-res edited JPEG photos" />
        <Button label="Add Deliverable" disabled={!deliverableDraft.trim()} onPress={addDeliverable} />
      </Sheet>

      <Sheet visible={sheet === 'review'} onClose={() => setSheet(null)} title="Review & Publish">
        <View style={styles.reviewBlock}>
          <ReviewRow label="Title" value={title.trim() || '—'} />
          <ReviewRow label="Category" value={category || '—'} />
          <ReviewRow label="Budget" value={budget ? `₹${Number(budget).toLocaleString('en-IN')} · ${paymentType}` : '—'} />
          <ReviewRow label="Deadline" value={prettyDate(deadline)} />
          <ReviewRow label="Duration" value={duration.trim() || '—'} />
          <ReviewRow label="Work mode" value={workMode === 'onsite' ? 'On-site' : 'Remote'} />
          <ReviewRow label="Skills" value={skills.length ? skills.join(', ') : '—'} />
          <ReviewRow label="Deliverables" value={deliverables.length ? `${deliverables.length} item(s)` : '—'} />
        </View>
        <InfoBanner
          tone="info"
          icon="info"
          title="What gets stored where"
          description="Title, description, skills, budget, deadline and location are real Gig columns. Category, payment type, duration and deliverables will be appended to the description under a labelled block — the schema has no columns for them."
        />
        <Button label={publish.isPending ? 'Publishing…' : 'Publish Gig'} size="lg" loading={publish.isPending} onPress={() => publish.mutate()} testID="post-gig-publish" />
      </Sheet>
    </Screen>
  );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.reviewRow}>
      <Text variant="caption" tone="tertiary" style={styles.reviewLabel}>
        {label}
      </Text>
      <Text variant="callout" style={styles.reviewValue}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.base,
    paddingHorizontal: layout.screenGutter,
    paddingVertical: space.md,
    backgroundColor: color.surface,
    borderBottomWidth: 1,
    borderBottomColor: color.divider,
  },
  headerSteps: { flex: 1 },

  content: {
    paddingHorizontal: layout.screenGutter,
    paddingTop: space.xl,
    paddingBottom: space['2xl'],
    gap: space.base,
    maxWidth: layout.maxContentWidth,
    width: '100%',
    alignSelf: 'center',
  },
  divider: { height: 1, backgroundColor: color.divider, marginVertical: space.sm },

  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  addChip: {
    borderWidth: 1,
    borderColor: color.primary,
    borderStyle: 'dashed',
    borderRadius: radius.full,
    paddingHorizontal: space.base,
    paddingVertical: space.sm,
  },
  addChipLabel: { color: color.primary, fontWeight: '600' },

  radioRow: { flexDirection: 'row', gap: space.md },
  radioCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    borderWidth: 1,
    borderColor: color.border,
    borderRadius: radius.md,
    backgroundColor: color.surface,
    paddingHorizontal: space.base,
    paddingVertical: space.md,
  },
  radioCardOn: { borderColor: color.primary, backgroundColor: color.primarySoft },
  radioDot: { width: 18, height: 18, borderRadius: 9, borderWidth: 2, borderColor: color.borderStrong },
  radioDotOn: { borderColor: color.primary, backgroundColor: color.primary, borderWidth: 5 },
  radioText: { flex: 1, gap: 2 },

  twoCol: { flexDirection: 'row', gap: space.md, alignItems: 'flex-start' },
  col: { flex: 1 },
  colSelect: { flex: 1, marginTop: 14 },

  deliverablesCard: {
    backgroundColor: color.surface,
    borderWidth: 1,
    borderColor: color.border,
    borderRadius: radius.md,
    paddingHorizontal: space.base,
  },
  deliverableRow: { flexDirection: 'row', alignItems: 'center', gap: space.md, paddingVertical: space.md },
  deliverableDivider: { borderTopWidth: 1, borderTopColor: color.divider },
  deliverableText: { flex: 1 },

  bottomSpacer: { height: space.lg },
  stickyBar: {
    backgroundColor: color.surface,
    borderTopWidth: 1,
    borderTopColor: color.divider,
    paddingHorizontal: layout.screenGutter,
    paddingVertical: space.md,
    ...shadow.sm,
  },
  publishBtn: { alignSelf: 'stretch' },

  reviewBlock: { gap: space.md },
  reviewRow: { flexDirection: 'row', gap: space.md },
  reviewLabel: { width: 92 },
  reviewValue: { flex: 1 },
  pressed: { opacity: 0.85 },
});
