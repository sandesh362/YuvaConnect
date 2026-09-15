/**
 * Messages List — NEW production screen to fix broken bottom navigation.
 *
 * Route: /(shared)/messages
 * Spec: wireframe 05-messages-trust (list portion)
 *
 * This screen was missing: STUDENT_TAB_ROUTES.messages and BUSINESS_TAB_ROUTES.messages
 * were null, causing the bottom tab to be a no-op. Now it lists real conversations
 * derived from gigs:
 * - Student: gigs where they have applied or been selected
 * - Business: gigs they posted that have applicants
 *
 * Each row opens the real chat at /(shared)/chat/[gigId].
 * Includes empty state, loading, error, search, and unread indicators.
 */
import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import {
  Avatar,
  BottomTabBar,
  EmptyState,
  ErrorState,
  Icon,
  IconButton,
  LoadingSkeleton,
  Screen,
  ScreenHeader,
  SearchBar,
  Text,
} from '@/components/ui';
import { BUSINESS_TABS, STUDENT_TABS } from '@/components/ui/BottomTabBar';
import { apiErrorMessage } from '@/config/api';
import { getMyGigs, listGigs } from '@/lib/gig-api';
import { listNotifications } from '@/lib/trust-api';
import { goBusinessTab, goStudentTab } from '@/lib/tab-nav';
import { useAuth } from '@/providers/auth-provider';
import { color } from '@/theme/colors';
import { radius, shadow } from '@/theme/radius';
import { layout, space } from '@/theme/spacing';
import type { Gig } from '@/types/api';

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'now';
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d`;
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

function ConversationRow({
  gig,
  counterparty,
  lastMessage,
  unread,
  onPress,
}: {
  gig: Gig;
  counterparty: string;
  lastMessage?: string;
  unread?: number;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Conversation with ${counterparty} about ${gig.title}`}
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
      <Avatar name={counterparty} size="lg" />
      <View style={styles.rowBody}>
        <View style={styles.rowTop}>
          <Text variant="calloutStrong" numberOfLines={1} style={styles.rowName}>
            {counterparty}
          </Text>
          <Text variant="caption" tone="tertiary">
            {timeAgo(gig.updatedAt)}
          </Text>
        </View>
        <Text variant="captionStrong" tone="secondary" numberOfLines={1} style={styles.gigTitle}>
          {gig.title} • ₹{Number(gig.budget).toLocaleString('en-IN')}
        </Text>
        <Text variant="callout" tone="secondary" numberOfLines={1} style={styles.lastMsg}>
          {lastMessage || 'Tap to open conversation'}
        </Text>
      </View>
      <View style={styles.rowRight}>
        {unread && unread > 0 ? (
          <View style={styles.unreadBadge}>
            <Text variant="captionStrong" style={styles.unreadText}>
              {unread > 9 ? '9+' : unread}
            </Text>
          </View>
        ) : null}
        <Icon name="chevronRight" size={16} color={color.textTertiary} />
      </View>
    </Pressable>
  );
}

export default function MessagesListScreen() {
  const { token, user } = useAuth();
  const isBusiness = user?.role === 'BUSINESS';
  const [query, setQuery] = useState('');

  const myGigsQuery = useQuery({
    queryKey: ['my-gigs', 'messages', token],
    queryFn: () => getMyGigs(token!),
    enabled: !!token,
  });

  const openGigsQuery = useQuery({
    queryKey: ['gigs', 'open', 'messages'],
    queryFn: () => listGigs(token!, {}),
    enabled: !!token && !isBusiness,
  });

  const notificationsQuery = useQuery({
    queryKey: ['notifications', 'messages-badge'],
    queryFn: () => listNotifications(token!, { limit: 50 }),
    enabled: !!token,
  });

  const conversations = useMemo(() => {
    const gigs: Gig[] = [];
    if (isBusiness) {
      gigs.push(...(myGigsQuery.data?.gigs ?? []));
    } else {
      // Student: gigs from applications + open gigs that have some activity
      const appliedGigIds = new Set((myGigsQuery.data?.applications ?? []).map((a) => a.gigId));
      const myGigs = (myGigsQuery.data?.gigs ?? []).filter((g) => appliedGigIds.has(g.id));
      // Also include gigs where student has applied (from applications array gig objects)
      const appGigs = (myGigsQuery.data?.applications ?? [])
        .map((a) => a.gig)
        .filter(Boolean) as Gig[];
      const combined = [...myGigs, ...appGigs];
      // Deduplicate by id
      const map = new Map<string, Gig>();
      combined.forEach((g) => map.set(g.id, g));
      gigs.push(...map.values());
      // If no applications yet, show empty (don't show random open gigs as conversations)
    }
    return gigs.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }, [myGigsQuery.data, isBusiness]);

  const filtered = useMemo(() => {
    if (!query.trim()) return conversations;
    const needle = query.trim().toLowerCase();
    return conversations.filter((gig) => {
      const business = gig.business?.businessProfile?.businessName ?? gig.business?.name ?? '';
      return [gig.title, business, gig.location].join(' ').toLowerCase().includes(needle);
    });
  }, [conversations, query]);

  const notificationMap = useMemo(() => {
    const map = new Map<string, number>();
    (notificationsQuery.data?.notifications ?? []).forEach((n) => {
      if (n.type === 'NEW_MESSAGE' && n.relatedGigId) {
        if (!n.isRead) {
          map.set(n.relatedGigId, (map.get(n.relatedGigId) ?? 0) + 1);
        }
      }
    });
    return map;
  }, [notificationsQuery.data]);

  const isLoading = myGigsQuery.isLoading;
  const isError = myGigsQuery.isError;

  return (
    <Screen testID="screen-messages-list">
      <ScreenHeader
        title="Messages"
        subtitle={isBusiness ? 'Conversations with students' : 'Conversations with businesses'}
        actions={[
          { icon: 'search', accessibilityLabel: 'Search', onPress: () => {} },
        ]}
      />

      <View style={styles.searchWrap}>
        <SearchBar value={query} onChangeText={setQuery} placeholder="Search conversations..." testID="messages-search" />
      </View>

      <ScrollView style={{flex:1}} contentContainerStyle={[styles.content, {flexGrow:1}]} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        {!token ? (
          <EmptyState
            title="Login to see messages"
            description="Your gig conversations live here. Login to continue."
            icon="chat"
            primaryLabel="Login"
            onPrimary={() => router.replace('/login' as never)}
          />
        ) : isLoading ? (
          <LoadingSkeleton count={4} variant="row" />
        ) : isError ? (
          <ErrorState title="Could not load messages" description={apiErrorMessage(myGigsQuery.error)} retryLabel="Retry" onRetry={() => myGigsQuery.refetch()} />
        ) : filtered.length === 0 ? (
          <EmptyState
            title={query.trim() ? 'No matching conversations' : 'No messages yet'}
            description={
              query.trim()
                ? `No conversations match "${query.trim()}". Try a different search.`
                : isBusiness
                ? 'When students apply to your gigs, conversations will appear here. Post a gig to get started.'
                : 'Apply to a gig and start a conversation with the business. Your messages will appear here.'
            }
            icon="chat"
            wellSize="lg"
            primaryLabel={isBusiness ? 'Post a Gig' : 'Discover Gigs'}
            onPrimary={() => router.push((isBusiness ? '/(business)/post-gig' : '/(student)/feed') as never)}
            secondaryLabel="Go to Home"
            onSecondary={() => router.replace('/home' as never)}
          />
        ) : (
          filtered.map((gig) => {
            const counterparty = isBusiness
              ? gig.applications?.find((a) => a.status === 'SELECTED')?.studentId
                ? 'Assigned Student'
                : `${gig.applications?.length ?? 0} applicants`
              : gig.business?.businessProfile?.businessName ?? gig.business?.name ?? 'Business';
            const unread = notificationMap.get(gig.id) ?? 0;
            // Derive last message preview from notification if available
            const relatedNotif = notificationsQuery.data?.notifications.find((n) => n.relatedGigId === gig.id);
            return (
              <ConversationRow
                key={gig.id}
                gig={gig}
                counterparty={counterparty}
                lastMessage={relatedNotif?.message}
                unread={unread}
                onPress={() => router.push(`/(shared)/chat/${gig.id}` as never)}
              />
            );
          })
        )}

        <View style={styles.trustStrip}>
          <Icon name="shieldCheckFilled" size={18} color={color.success} />
          <Text variant="caption" tone="secondary" style={styles.trustText}>
            Keep payments and important communication within YuvaConnect to stay protected.
          </Text>
        </View>
      </ScrollView>

      <BottomTabBar
        items={isBusiness ? BUSINESS_TABS : STUDENT_TABS}
        activeKey="messages"
        onSelect={isBusiness ? goBusinessTab : goStudentTab}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  searchWrap: {
    paddingHorizontal: layout.screenGutter,
    paddingVertical: space.md,
    backgroundColor: color.surface,
    borderBottomWidth: 1,
    borderBottomColor: color.borderSubtle,
  },
  content: {
    paddingHorizontal: layout.screenGutter,
    paddingTop: space.md,
    paddingBottom: 120,
    gap: space.sm,
    maxWidth: layout.maxContentWidth,
    width: '100%',
    alignSelf: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    backgroundColor: color.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: color.borderSubtle,
    padding: space.base,
    ...shadow.sm,
  },
  pressed: { opacity: 0.85, transform: [{ scale: 0.99 }] },
  rowBody: { flex: 1, gap: 3 },
  rowTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: space.sm },
  rowName: { flex: 1 },
  gigTitle: { lineHeight: 16 },
  lastMsg: { lineHeight: 18 },
  rowRight: { alignItems: 'center', gap: space.sm },
  unreadBadge: {
    backgroundColor: color.primary,
    borderRadius: radius.full,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  unreadText: { color: color.textInverse, fontSize: 11, fontWeight: '700' },
  trustStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    backgroundColor: color.surfaceMuted,
    borderRadius: radius.md,
    padding: space.base,
    marginTop: space.lg,
  },
  trustText: { flex: 1, lineHeight: 18 },
});
