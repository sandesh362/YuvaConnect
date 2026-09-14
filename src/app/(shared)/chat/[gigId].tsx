/**
 * Messages & Trust Center — wireframe 5/37. Rebuild in place (route unchanged).
 *
 * Route: /(shared)/chat/[gigId]  ·  Spec: docs/wireframes/05-messages-trust.md
 *
 * Data honesty:
 *  - Messages are REAL: listMessages / sendMessage, polled every 15s (the API
 *    is REST — there is no socket; polling is flagged, not presented as realtime).
 *  - Presence ("Online") and the verified tick in the header have NO backing
 *    field, so the subtitle shows the counterparty's ROLE instead. Flagged.
 *  - "View Tracker" and "View Deliverable" point at screens 17/18 which have
 *    not shipped: visible per wireframe, quiet no-ops until then (same rule
 *    as the tab bar). "Request Payment" has no endpoint at all → explainer
 *    InfoBanner, the approved pattern for flag-without-faking.
 *  - The kebab opens nothing in any wireframe; it routes to /support, which is
 *    what a chat overflow is actually for (report / get help).
 */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';

import {
  Avatar,
  EmptyState,
  ErrorState,
  Icon,
  IconButton,
  InfoBanner,
  LoadingSkeleton,
  Screen,
  SecondaryButton,
  Text,
} from '@/components/ui';
import { apiErrorMessage } from '@/config/api';
import { getApplicants, getGig } from '@/lib/gig-api';
import { listMessages, sendMessage } from '@/lib/trust-api';
import { useAuth } from '@/providers/auth-provider';
import { color } from '@/theme/colors';
import type { IconName } from '@/theme/icons';
import { radius, shadow } from '@/theme/radius';
import { layout, space } from '@/theme/spacing';
import type { Message } from '@/types/api';

const SEND = 48;

function dayLabel(iso: string) {
  const date = new Date(iso);
  const today = new Date();
  const yesterday = new Date(Date.now() - 86400000);
  if (date.toDateString() === today.toDateString()) return 'Today';
  if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return date.toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
}

function timeOf(iso: string) {
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function Bubble({ mine, text, time }: { mine: boolean; text: string; time: string }) {
  return (
    <View style={[styles.bubbleRow, mine && styles.bubbleRowMine]}>
      <View style={[styles.bubble, mine ? styles.bubbleMine : styles.bubbleTheirs]}>
        <Text variant="body" style={[styles.bubbleText, mine && styles.bubbleTextMine]}>
          {text}
        </Text>
        <Text variant="caption" style={[styles.bubbleTime, mine && styles.bubbleTimeMine]}>
          {time}
        </Text>
      </View>
    </View>
  );
}

export default function ChatScreen() {
  const { gigId } = useLocalSearchParams<{ gigId: string }>();
  const { token, user } = useAuth();
  const queryClient = useQueryClient();
  const [draft, setDraft] = useState('');
  const [railOpen, setRailOpen] = useState(true);
  const [paymentNotice, setPaymentNotice] = useState(false);

  const gigQuery = useQuery({
    queryKey: ['gig', gigId],
    queryFn: () => getGig(token!, gigId!),
    enabled: !!token && !!gigId,
  });

  const isStudent = user?.role === 'STUDENT';

  const applicantsQuery = useQuery({
    queryKey: ['applicants', gigId],
    queryFn: () => getApplicants(token!, gigId!),
    enabled: !!token && !!gigId && !isStudent,
  });

  const messagesQuery = useQuery({
    queryKey: ['messages', gigId],
    queryFn: () => listMessages(token!, gigId!, { limit: 50 }),
    enabled: !!token && !!gigId,
    refetchInterval: 15000, // REST API — flagged polling, not fake realtime
  });

  const sendMutation = useMutation({
    mutationFn: () => sendMessage(token!, gigId!, draft.trim()),
    onSuccess: () => {
      setDraft('');
      queryClient.invalidateQueries({ queryKey: ['messages', gigId] });
    },
  });

  const counterparty = useMemo(() => {
    if (isStudent) {
      const name = gigQuery.data?.business?.businessProfile?.businessName ?? gigQuery.data?.business?.name;
      return name ? { name, kind: 'Business' } : null;
    }
    const selected = applicantsQuery.data?.find((applicant) => applicant.status === 'SELECTED');
    return selected ? { name: selected.student.name, kind: 'Student' } : null;
  }, [isStudent, gigQuery.data, applicantsQuery.data]);

  const thread = useMemo(() => {
    const page = messagesQuery.data;
    if (!page) return [] as Message[];
    return [...page.messages].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  }, [messagesQuery.data]);

  const gig = gigQuery.data;
  const noticeIndex = thread.length ? Math.min(3, thread.length - 1) : -1;

  const quickActions: { label: string; icon: IconName; onPress: () => void }[] = [
    {
      label: 'Share Portfolio',
      icon: 'image',
      onPress: () => router.push((isStudent ? '/(student)/profile' : '/(business)/profile') as never),
    },
    { label: 'View Deliverable', icon: 'clipboard', onPress: () => router.push(`/(student)/submit/${gigId}` as never) }, // screen 18 shipped
    { label: 'Request Payment', icon: 'wallet', onPress: () => setPaymentNotice(true) },
  ];

  return (
    <Screen testID="screen-chat">
      {/* --- Header: counterparty, not presence (presence has no data) --- */}
      <View style={styles.header}>
        <IconButton name="arrowBack" accessibilityLabel="Back" onPress={() => router.back()} />
        <Avatar name={counterparty?.name ?? '…'} size="md" tone={color.accent} />
        <View style={styles.headerBody}>
          <View style={styles.headerNameRow}>
            <Text variant="heading" numberOfLines={1}>
              {counterparty?.name ?? 'Loading…'}
            </Text>
          </View>
          <Text variant="caption" tone="secondary">
            {counterparty?.kind ?? '—'}
          </Text>
        </View>
        <IconButton
          name="moreVertical"
          accessibilityLabel="Support and report options"
          onPress={() => router.push('/support' as never)}
        />
      </View>

      {/* --- Gig context bar --- */}
      {gig ? (
        <View style={styles.contextBar}>
          <View style={styles.contextCopy}>
            <Text variant="captionStrong" tone="secondary" numberOfLines={1}>
              {gig.title}
            </Text>
            <Text variant="calloutStrong" numberOfLines={1}>
              Budget: ₹{Number(gig.budget).toLocaleString()}
            </Text>
          </View>
          <SecondaryButton
            label="View Tracker"
            size="sm"
            fullWidth={false}
            onPress={() => router.push(`/(student)/tracker/${gigId}` as never)}
          />
        </View>
      ) : null}

      {/* --- Thread --- */}
      <ScrollView style={styles.scroller} contentContainerStyle={styles.thread} showsVerticalScrollIndicator={false}>
        {!token ? (
          <EmptyState
            title="Login to view this conversation"
            description="Messages are private to the gig's student and business."
            icon="chat"
            primaryLabel="Login"
            onPrimary={() => router.push('/login' as never)}
          />
        ) : messagesQuery.isError ? (
          <ErrorState
            title="Could not load messages"
            description={apiErrorMessage(messagesQuery.error)}
            retryLabel="Retry"
            onRetry={() => messagesQuery.refetch()}
          />
        ) : messagesQuery.isLoading ? (
          <LoadingSkeleton count={3} variant="row" />
        ) : thread.length === 0 ? (
          <EmptyState
            title="No messages yet"
            description="Say hello — and keep payments and important communication within YuvaConnect to stay protected."
            icon="chat"
          />
        ) : (
          thread.map((message, index) => {
            const mine = message.senderId === user?.id;
            const label = dayLabel(message.createdAt);
            const previous = index > 0 ? dayLabel(thread[index - 1].createdAt) : null;
            return (
              <View key={message.id}>
                {label !== previous ? (
                  <Text variant="captionStrong" tone="secondary" style={styles.dayLabel}>
                    {label}
                  </Text>
                ) : null}
                <Bubble mine={mine} text={message.content} time={timeOf(message.createdAt)} />
                {index === noticeIndex ? (
                  <View style={styles.trustNotice}>
                    <Icon name="shieldCheckFilled" size={20} color={color.primary} />
                    <Text variant="calloutStrong" style={styles.trustCopy}>
                      Keep payments and important communication within YuvaConnect to stay protected.
                    </Text>
                  </View>
                ) : null}
              </View>
            );
          })
        )}
        {paymentNotice ? (
          <InfoBanner
            tone="info"
            icon="wallet"
            title="Payment requests are flagged, not faked"
            description="The live API has no payment-request endpoint yet — payments are released from the Work Tracker once work is approved."
            style={styles.notice}
          />
        ) : null}
      </ScrollView>

      {/* --- Composer + quick actions --- */}
      <View style={styles.composerWrap}>
        <View style={styles.composer}>
          <IconButton
            name="addCircle"
            size={26}
            color={color.textSecondary}
            accessibilityLabel="Toggle quick actions"
            onPress={() => setRailOpen((open) => !open)}
          />
          <TextInput
            style={styles.input}
            placeholder="Type your message..."
            placeholderTextColor={color.textTertiary}
            value={draft}
            onChangeText={setDraft}
            multiline
            testID="chat-input"
          />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Send message"
            disabled={!draft.trim() || sendMutation.isPending}
            onPress={() => sendMutation.mutate()}
            style={({ pressed }) => [styles.send, (!draft.trim() || sendMutation.isPending) && styles.sendDisabled, pressed && styles.pressed]}>
            <Icon name="sendFilled" size={20} color={color.textInverse} />
          </Pressable>
        </View>
        {railOpen ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.rail}>
            {quickActions.map((action) => (
              <Pressable
                key={action.label}
                onPress={action.onPress}
                accessibilityRole="button"
                accessibilityLabel={action.label}
                style={({ pressed }) => [styles.railChip, pressed && styles.pressed]}>
                <Icon name={action.icon} size={16} color={color.textPrimary} />
                <Text variant="callout" numberOfLines={1}>
                  {action.label}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        ) : null}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    backgroundColor: color.surface,
    paddingHorizontal: space.sm,
    paddingVertical: space.sm,
  },
  headerBody: { flex: 1 },
  headerNameRow: { flexDirection: 'row', alignItems: 'center', gap: space.xs },

  contextBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: space.md,
    backgroundColor: color.surfaceMuted,
    marginHorizontal: space.base,
    marginTop: space.xs,
    marginBottom: space.md,
    borderRadius: radius.md,
    paddingHorizontal: space.base,
    paddingVertical: space.md,
  },
  contextCopy: { flex: 1, gap: 2 },

  scroller: { flex: 1 },
  thread: { padding: layout.screenGutter, gap: space.md, maxWidth: layout.maxContentWidth, width: '100%', alignSelf: 'center' },
  dayLabel: { textAlign: 'center', marginTop: space.md, marginBottom: space.xs },

  bubbleRow: { alignItems: 'flex-start' },
  bubbleRowMine: { alignItems: 'flex-end' },
  bubble: {
    maxWidth: '74%',
    borderRadius: radius.md,
    paddingHorizontal: space.base,
    paddingVertical: space.md,
    gap: space.sm,
  },
  bubbleTheirs: { backgroundColor: color.surfaceMuted, borderTopLeftRadius: radius.xs },
  bubbleMine: { backgroundColor: color.primary, borderTopRightRadius: radius.xs, ...shadow.sm },
  bubbleText: { color: color.textPrimary, lineHeight: 23 },
  bubbleTextMine: { color: color.textInverse },
  bubbleTime: { color: color.textSecondary, alignSelf: 'flex-start' },
  bubbleTimeMine: { color: color.primaryBorder, alignSelf: 'flex-end' },

  trustNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    backgroundColor: color.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: color.borderSubtle,
    paddingHorizontal: space.base,
    paddingVertical: space.md,
    marginVertical: space.md,
  },
  trustCopy: { flex: 1, lineHeight: 20 },
  notice: { marginTop: space.md },

  composerWrap: {
    backgroundColor: color.surface,
    borderTopWidth: 1,
    borderTopColor: color.borderSubtle,
    paddingTop: space.md,
    paddingBottom: space.sm,
    gap: space.md,
  },
  composer: { flexDirection: 'row', alignItems: 'flex-end', gap: space.md, paddingHorizontal: space.base },
  input: {
    flex: 1,
    maxHeight: 96,
    minHeight: 40,
    color: color.textPrimary,
    fontSize: 15,
    lineHeight: 20,
    paddingVertical: space.sm,
  },
  send: {
    width: SEND,
    height: SEND,
    borderRadius: radius.full,
    backgroundColor: color.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow.primary,
  },
  sendDisabled: { opacity: 0.45 },
  pressed: { opacity: 0.85 },

  rail: { gap: space.md, paddingHorizontal: space.base, paddingBottom: space.xs },
  railChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    borderWidth: 1,
    borderColor: color.border,
    borderRadius: radius.md,
    backgroundColor: color.surface,
    paddingHorizontal: space.base,
    paddingVertical: space.md,
    maxWidth: 220,
  },
});
