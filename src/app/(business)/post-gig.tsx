/**
 * Post a New Gig — FIXED production QA version.
 * Route: /(business)/post-gig
 *
 * Fixes:
 * - CTA always visible: KeyboardAvoidingView, large bottom padding, sticky bar with safe area
 * - Validation: title, description, budget, deadline, skills all required, inline hints
 * - Publish flow: Review & Publish -> Publish Gig -> Success state with View/Manage
 * - Edit mode preserved
 * - Keyboard never hides CTA
 * - Success banner and navigation to gig detail
 */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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
import { createGig, getGig, updateGig } from '@/lib/gig-api';
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
  'Graphic Design',
  'Video Editing',
  'Web Development',
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

function parseStoredGig(description: string) {
  const [base, extras = ''] = description.split('\n---\n');
  const parsed: { category?: string; paymentType?: string; duration?: string; workMode?: string; deliverables: string[] } = { deliverables: [] };
  let inDeliverables = false;
  for (const rawLine of extras.split('\n')) {
    const line = rawLine.trim();
    if (!line) continue;
    if (line.startsWith('- ') && inDeliverables) {
      parsed.deliverables.push(line.slice(2).trim());
      continue;
    }
    inDeliverables = false;
    if (line.startsWith('Category: ')) parsed.category = line.slice('Category: '.length);
    else if (line.startsWith('Payment type: ')) parsed.paymentType = line.slice('Payment type: '.length);
    else if (line.startsWith('Duration: ')) parsed.duration = line.slice('Duration: '.length);
    else if (line.startsWith('Work mode: ')) parsed.workMode = line.slice('Work mode: '.length);
    else if (line === 'Deliverables:') inDeliverables = true;
  }
  return { base: base.trim(), ...parsed };
}

export default function PostGigScreen() {
  const { token } = useAuth();
  const client = useQueryClient();
  const insets = useSafeAreaInsets();
  const { gigId } = useLocalSearchParams<{ gigId?: string }>();
  const editMode = !!gigId;

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

  const [sheet, setSheet] = useState<null | 'category' | 'payment' | 'deadline' | 'skill' | 'deliverable' | 'review' | 'success'>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [publishedGigId, setPublishedGigId] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const profileQuery = useQuery({
    queryKey: ['profile', token],
    queryFn: () => getProfile(token!),
    enabled: !!token,
  });
  const editGigQuery = useQuery({
    queryKey: ['gig', gigId, token],
    queryFn: () => getGig(token!, gigId!),
    enabled: !!token && editMode,
  });

  useEffect(() => {
    const gig = editGigQuery.data;
    if (!gig) return;
    const stored = parseStoredGig(gig.description);
    setTitle(gig.title);
    setDescription(stored.base);
    if (stored.category) setCategory(stored.category);
    if (stored.paymentType) setPaymentType(stored.paymentType);
    if (stored.duration) setDuration(stored.duration);
    if (stored.deliverables.length) setDeliverables(stored.deliverables);
    if (stored.workMode) setWorkMode(stored.workMode.toLowerCase() === 'remote' ? 'remote' : 'onsite');
    setSkills(gig.skillsRequired ?? []);
    setBudget(String(Number(gig.budget)));
    setDeadline(new Date(gig.deadline).toISOString().slice(0, 10));
  }, [editGigQuery.data]);

  useEffect(() => {
    const profile = profileQuery.data?.profile;
    if (profile && 'category' in profile && profile.category && !category) setCategory(profile.category);
  }, [profileQuery.data]);

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!title.trim()) errs.title = 'Gig title is required';
    else if (title.trim().length < 5) errs.title = 'Title must be at least 5 characters';
    if (!description.trim()) errs.description = 'Description is required';
    else if (description.trim().length < 20) errs.description = 'Description must be at least 20 characters';
    if (!budget.trim()) errs.budget = 'Budget is required';
    else if (Number(budget) <= 0) errs.budget = 'Budget must be greater than 0';
    else if (Number(budget) < 500) errs.budget = 'Minimum budget is ₹500';
    if (skills.length === 0) errs.skills = 'Select at least one skill';
    if (!deadline.trim()) errs.deadline = 'Deadline is required';
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const publish = useMutation({
    mutationFn: () => {
      if (!validate()) throw new Error('Please fix the highlighted fields');
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
      const input = {
        title: title.trim(),
        description: finalDescription,
        skillsRequired: skills,
        budget: Number(budget),
        deadline: new Date(deadline).toISOString(),
        location: workMode === 'onsite' ? address.trim() || 'On-site - Local business area' : 'Remote',
      };
      return editMode ? updateGig(token!, gigId!, input) : createGig(token!, input);
    },
    onSuccess: (gig) => {
      client.invalidateQueries({ queryKey: ['my-gigs'] });
      client.invalidateQueries({ queryKey: ['gigs'] });
      setPublishedGigId(gig.id);
      setSheet('success');
    },
    onError: (err) => setError(apiErrorMessage(err) || (err as Error).message),
  });

  const canPublish = title.trim().length >= 5 && description.trim().length >= 20 && Number(budget) > 0 && skills.length > 0 && !Number.isNaN(new Date(deadline).getTime());

  const toggleSkill = (skill: string) =>
    setSkills((current) => {
      const next = current.includes(skill) ? current.filter((item) => item !== skill) : [...current, skill];
      if (fieldErrors.skills && next.length > 0) setFieldErrors((prev) => ({ ...prev, skills: '' }));
      return next;
    });

  const addCustomSkill = () => {
    const skill = customSkill.trim();
    if (skill && !skills.includes(skill)) setSkills((current) => [...current, skill]);
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
      <View style={styles.header}>
        <IconButton name="close" variant="plain" accessibilityLabel="Close" onPress={() => router.back()} testID="post-gig-close" />
        <StepProgress total={4} current={1} style={styles.headerSteps} />
        <TextLink
          label="Save Draft"
          iconRight={null}
          onPress={() =>
            setNotice('Drafts are not supported yet — gigs are published directly. Your progress stays in the form until you publish.')
          }
        />
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.kav}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <Text variant="title2">Basic Details</Text>
          <Text variant="body" tone="secondary">
            Clearly describe the task to attract the right students.
          </Text>

          <TextField
            label="Gig Title *"
            value={title}
            onChangeText={(v) => {
              setTitle(v);
              if (fieldErrors.title) setFieldErrors((p) => ({ ...p, title: '' }));
            }}
            placeholder="e.g. Product Photography for Bakery"
            errorText={fieldErrors.title}
            testID="post-gig-title"
          />
          <FloatingLabelSelect label="Category" value={category} placeholder="Select category" onPress={() => setSheet('category')} testID="post-gig-category" />
          <TextField
            label="Description *"
            type="textarea"
            value={description}
            onChangeText={(v) => {
              setDescription(v);
              if (fieldErrors.description) setFieldErrors((p) => ({ ...p, description: '' }));
            }}
            placeholder="Looking for a student to take 15 high-quality product photos of our bakery items for Instagram..."
            errorText={fieldErrors.description}
            testID="post-gig-description"
          />

          <View style={styles.divider} />

          <Text variant="title2">Skills & Requirements *</Text>
          <Text variant="body" tone="secondary">
            What expertise does the student need?
          </Text>
          {fieldErrors.skills ? (
            <Text variant="caption" style={{ color: color.danger }}>
              {fieldErrors.skills}
            </Text>
          ) : null}
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

          <Text variant="title2">Budget & Timeline *</Text>
          <Text variant="body" tone="secondary">
            Define the compensation and deadlines.
          </Text>
          <View style={styles.twoCol}>
            <TextField
              label="Budget (₹) *"
              icon="wallet"
              value={budget}
              onChangeText={(v) => {
                setBudget(v);
                if (fieldErrors.budget) setFieldErrors((p) => ({ ...p, budget: '' }));
              }}
              placeholder="2500"
              keyboardType="number-pad"
              errorText={fieldErrors.budget}
              style={styles.col}
              testID="post-gig-budget"
            />
            <FloatingLabelSelect label="Payment type" value={paymentType} onPress={() => setSheet('payment')} style={styles.colSelect} testID="post-gig-payment" />
          </View>
          <View style={styles.twoCol}>
            <FloatingLabelSelect
              label="Deadline *"
              value={prettyDate(deadline)}
              icon="calendar"
              onPress={() => setSheet('deadline')}
              style={styles.colSelect}
              testID="post-gig-deadline"
            />
            <TextField label="Duration" icon="stopwatch" value={duration} onChangeText={setDuration} placeholder="3 Days" style={styles.col} testID="post-gig-duration" />
          </View>
          {fieldErrors.deadline ? (
            <Text variant="caption" style={{ color: color.danger }}>
              {fieldErrors.deadline}
            </Text>
          ) : null}

          <View style={styles.divider} />

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

          {notice ? <InfoBanner tone="info" icon="info" title="Note" description={notice} /> : null}
          {error ? <InfoBanner tone="danger" icon="offline" title="Could not publish" description={error} /> : null}

          <View style={styles.bottomSpacer} />
        </ScrollView>
      </KeyboardAvoidingView>

      <View style={[styles.stickyBar, { paddingBottom: Math.max(insets.bottom, space.md) }]}>
        <Button
          label={editMode ? 'Review & Save' : 'Review & Publish'}
          size="lg"
          disabled={!canPublish}
          onPress={() => {
            if (!validate()) return;
            setSheet('review');
          }}
          style={styles.publishBtn}
          testID="post-gig-review"
        />
        {!canPublish ? (
          <Text variant="caption" tone="tertiary" style={styles.hint}>
            Fill title, description (20+ chars), budget, and at least 1 skill to continue
          </Text>
        ) : null}
      </View>

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
        <TextField label="Custom date" icon="calendar" value={customDeadline} onChangeText={setCustomDeadline} placeholder="YYYY-MM-DD" autoCapitalize="none" />
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

      <Sheet visible={sheet === 'review'} onClose={() => setSheet(null)} title={editMode ? 'Review & Save' : 'Review & Publish'}>
        <View style={styles.reviewBlock}>
          <ReviewRow label="Title" value={title.trim() || '—'} />
          <ReviewRow label="Category" value={category || '—'} />
          <ReviewRow label="Budget" value={budget ? `₹${Number(budget).toLocaleString('en-IN')} · ${paymentType}` : '—'} />
          <ReviewRow label="Deadline" value={prettyDate(deadline)} />
          <ReviewRow label="Duration" value={duration.trim() || '—'} />
          <ReviewRow label="Work mode" value={workMode === 'onsite' ? 'On-site' : 'Remote'} />
          <ReviewRow label="Skills" value={skills.length ? skills.join(', ') : '—'} />
          <ReviewRow label="Deliverables" value={deliverables.length ? `${deliverables.length} item(s)` : '—'} />
          <ReviewRow label="Description" value={description.trim().slice(0, 120) + (description.trim().length > 120 ? '...' : '')} />
        </View>
        <InfoBanner tone="success" icon="shieldCheckFilled" title="Ready to publish" description="This gig will be visible to verified students nearby. You can edit it while it's OPEN." />
        <Button
          label={publish.isPending ? 'Publishing…' : editMode ? 'Save Changes' : 'Publish Gig'}
          size="lg"
          loading={publish.isPending}
          onPress={() => publish.mutate()}
          testID="post-gig-publish"
        />
      </Sheet>

      <Sheet visible={sheet === 'success'} onClose={() => setSheet(null)} title="Gig Published!">
        <View style={styles.successWrap}>
          <View style={styles.successIcon}>
            <Icon name="checkCircleFilled" size={48} color={color.success} />
          </View>
          <Text variant="title1" style={styles.successTitle}>
            Gig published successfully 🎉
          </Text>
          <Text variant="body" tone="secondary" style={styles.successDesc}>
            Your gig is now live and visible to verified students. You'll get notified when someone applies.
          </Text>
          <View style={styles.successActions}>
            <Button
              label="View Gig"
              size="lg"
              onPress={() => {
                setSheet(null);
                if (publishedGigId) router.replace(`/(business)/gig/${publishedGigId}` as never);
              }}
              testID="success-view-gig"
            />
            <Button
              label="Manage Gigs"
              variant="secondary"
              size="lg"
              onPress={() => {
                setSheet(null);
                router.replace('/(business)/my-gigs' as never);
              }}
              testID="success-manage"
            />
            <Button
              label="Post Another"
              variant="secondary"
              size="lg"
              onPress={() => {
                setSheet(null);
                setTitle('');
                setDescription('');
                setBudget('');
                setSkills([]);
                setDeliverables([]);
                setPublishedGigId(null);
              }}
            />
          </View>
        </View>
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
  kav: { flex: 1 },

  content: {
    paddingHorizontal: layout.screenGutter,
    paddingTop: space.xl,
    paddingBottom: 140,
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
    paddingTop: space.md,
    gap: space.sm,
    ...shadow.sm,
  },
  publishBtn: { alignSelf: 'stretch' },
  hint: { textAlign: 'center' },

  reviewBlock: { gap: space.md },
  reviewRow: { flexDirection: 'row', gap: space.md },
  reviewLabel: { width: 92 },
  reviewValue: { flex: 1 },
  pressed: { opacity: 0.85 },

  successWrap: { alignItems: 'center', gap: space.lg, paddingVertical: space.lg },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: radius.full,
    backgroundColor: color.successSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  successTitle: { textAlign: 'center' },
  successDesc: { textAlign: 'center', lineHeight: 22 },
  successActions: { width: '100%', gap: space.md, marginTop: space.md },
});
