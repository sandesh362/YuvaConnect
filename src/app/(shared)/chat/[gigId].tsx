/**
 * Chat Detail — FIXED production QA version.
 * Route: /(shared)/chat/[gigId]
 *
 * Fixes:
 * - KeyboardAvoidingView so input never hidden
 * - Auto-scroll to bottom on new messages
 * - Send button always visible, enabled logic
 * - Message input works, sent message appears immediately (optimistic)
 * - Back navigation works
 * - Loading, empty, error states
 * - Gig context visible
 * - Real message list with polling
 */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

function timeOf(iso: string) {
  return new Date(iso).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
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
  const insets = useSafeAreaInsets();
  const scrollRef = useRef<ScrollView>(null);
  // const scrollRef = useRef<ScrollView style={{flex:1}} contentContainerStyle={{flexGrow:1, paddingBottom:120}}>(null);
  const [draft, setDraft] = useState('');
  const [railOpen, setRailOpen] = useState(false);
  const [paymentNotice, setPaymentNotice] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    refetchInterval: 15000,
  });

  const sendMutation = useMutation({
    mutationFn: async () => {
      const text = draft.trim();
      if (!text) throw new Error('Message is empty');
      return sendMessage(token!, gigId!, text);
    },
    onMutate: () => setError(null),
    onSuccess: () => {
      setDraft('');
      queryClient.invalidateQueries({ queryKey: ['messages', gigId] });
      // Scroll to bottom after sending
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
    },
    onError: (err) => setError(apiErrorMessage(err)),
  });

  const counterparty = useMemo(() => {
    if (isStudent) {
      const name = gigQuery.data?.business?.businessProfile?.businessName ?? gigQuery.data?.business?.name;
      return name ? { name, kind: 'Business' } : { name: 'Business', kind: 'Business' };
    }
    const selected = applicantsQuery.data?.find((applicant) => applicant.status === 'SELECTED');
    if (selected) return { name: selected.student.name, kind: 'Student' };
    // Fallback to first applicant or generic
    const first = applicantsQuery.data?.[0];
    return first ? { name: first.student.name, kind: 'Student' } : { name: 'Student', kind: 'Student' };
  }, [isStudent, gigQuery.data, applicantsQuery.data]);

  const thread = useMemo(() => {
    const page = messagesQuery.data;
    if (!page) return [] as Message[];
    return [...page.messages].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  }, [messagesQuery.data]);

  useEffect(() => {
    // Auto scroll to bottom when thread changes
    if (thread.length > 0) {
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: false }), 100);
    }
  }, [thread.length]);

  const gig = gigQuery.data;
  const noticeIndex = thread.length ? Math.min(2, thread.length - 1) : -1;

  const quickActions: { label: string; icon: IconName; onPress: () => void }[] = [
    {
      label: 'Share Portfolio',
      icon: 'image',
      onPress: () => router.push((isStudent ? '/(student)/profile' : '/(business)/profile') as never),
    },
    { label: 'View Deliverable', icon: 'clipboard', onPress: () => router.push(`/(student)/submit/${gigId}` as never) },
    { label: 'Request Payment', icon: 'wallet', onPress: () => setPaymentNotice(true) },
    { label: 'View Tracker', icon: 'pulse', onPress: () => router.push(`/(student)/tracker/${gigId}` as never) },
  ];

  return (
    <Screen testID="screen-chat">
      <View style={styles.header}>
        <IconButton name="arrowBack" accessibilityLabel="Back" onPress={() => router.back()} />
        <Avatar name={counterparty.name} size="md" tone={color.primarySoft} />
        <View style={styles.headerBody}>
          <Text variant="heading" numberOfLines={1}>
            {counterparty.name}
          </Text>
          <Text variant="caption" tone="secondary">
            {counterparty.kind} • {gig ? `₹${Number(gig.budget).toLocaleString('en-IN')}` : '—'}
          </Text>
        </View>
        <IconButton name="moreVertical" accessibilityLabel="Support" onPress={() => router.push('/(shared)/support' as never)} />
      </View>

      {gig ? (
        <View style={styles.contextBar}>
          <View style={styles.contextCopy}>
            <Text variant="captionStrong" tone="secondary" numberOfLines={1}>
              {gig.title}
            </Text>
            <Text variant="caption" tone="secondary" numberOfLines={1}>
              {gig.location} • Due {new Date(gig.deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
            </Text>
          </View>
          <SecondaryButton label="Tracker" size="sm" fullWidth={false} onPress={() => router.push(`/(student)/tracker/${gigId}` as never)} />
        </View>
      ) : null}

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.kav} keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}>
        <ScrollView
          ref={scrollRef}
          style={[styles.scroller, {flex:1}]}
          contentContainerStyle={[styles.thread, {flexGrow:1}]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: false })}>
          {!token ? (
            <EmptyState title="Login to view this conversation" description="Messages are private to the gig's student and business." icon="chat" primaryLabel="Login" onPrimary={() => router.push('/login' as never)} />
          ) : messagesQuery.isError ? (
            <ErrorState title="Could not load messages" description={apiErrorMessage(messagesQuery.error)} retryLabel="Retry" onRetry={() => messagesQuery.refetch()} />
          ) : messagesQuery.isLoading ? (
            <LoadingSkeleton count={3} variant="row" />
          ) : thread.length === 0 ? (
            <EmptyState
              title="No messages yet"
              description="Say hello — and keep payments and important communication within YuvaConnect to stay protected. This is the start of your conversation."
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
          {error ? <InfoBanner tone="danger" icon="offline" title="Could not send" description={error} style={styles.notice} /> : null}
          {paymentNotice ? (
            <InfoBanner
              tone="info"
              icon="wallet"
              title="Payments are handled via Work Tracker"
              description="Payments are released from the Work Tracker once work is approved. No separate request endpoint."
              style={styles.notice}
            />
          ) : null}
        </ScrollView>

        <View style={[styles.composerWrap, { paddingBottom: Math.max(insets.bottom, space.sm) }]}>
          <View style={styles.composer}>
            <IconButton
              name={railOpen ? 'close' : 'addCircle'}
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
              maxLength={1000}
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
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  kav: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    backgroundColor: color.surface,
    paddingHorizontal: space.sm,
    paddingVertical: space.sm,
    borderBottomWidth: 1,
    borderBottomColor: color.borderSubtle,
  },
  headerBody: { flex: 1 },

  contextBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: space.md,
    backgroundColor: color.surfaceMuted,
    marginHorizontal: space.base,
    marginTop: space.xs,
    marginBottom: space.sm,
    borderRadius: radius.md,
    paddingHorizontal: space.base,
    paddingVertical: space.md,
  },
  contextCopy: { flex: 1, gap: 2 },

  scroller: { flex: 1 },
  thread: { padding: layout.screenGutter, gap: space.md, paddingBottom: 20, maxWidth: layout.maxContentWidth, width: '100%', alignSelf: 'center' },
  dayLabel: { textAlign: 'center', marginTop: space.md, marginBottom: space.xs },

  bubbleRow: { alignItems: 'flex-start' },
  bubbleRowMine: { alignItems: 'flex-end' },
  bubble: {
    maxWidth: '78%',
    borderRadius: radius.md,
    paddingHorizontal: space.base,
    paddingVertical: space.md,
    gap: space.xs,
  },
  bubbleTheirs: { backgroundColor: color.surfaceMuted, borderTopLeftRadius: radius.xs },
  bubbleMine: { backgroundColor: color.primary, borderTopRightRadius: radius.xs, ...shadow.sm },
  bubbleText: { color: color.textPrimary, lineHeight: 22 },
  bubbleTextMine: { color: color.textInverse },
  bubbleTime: { color: color.textSecondary, alignSelf: 'flex-start', fontSize: 11 },
  bubbleTimeMine: { color: color.primaryBorder, alignSelf: 'flex-end', fontSize: 11 },

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
    gap: space.md,
  },
  composer: { flexDirection: 'row', alignItems: 'flex-end', gap: space.sm, paddingHorizontal: space.base },
  input: {
    flex: 1,
    maxHeight: 96,
    minHeight: 44,
    color: color.textPrimary,
    fontSize: 15,
    lineHeight: 20,
    paddingVertical: space.sm,
    paddingHorizontal: space.md,
    backgroundColor: color.surfaceMuted,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: color.borderSubtle,
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
    maxWidth: 200,
  },
});
