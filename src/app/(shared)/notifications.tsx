/**
 * Notifications — wireframe 21/37 (shared with 36). Rebuild in place.
 *
 * Route: /(shared)/notifications  ·  Spec: docs/wireframes/21-student-notifications.md
 *
 * Data honesty: everything here is the REAL notifications feed —
 * listNotifications (paged), mark-all-read and per-item read endpoints all
 * exist and are wired. Wireframe 36 (business) shares this route: its own
 * filter set (All/Applicants/Work/Payments), "New Activity" (unread) grouping
 * with washed cards vs plain hairline rows for read items, a flagged gear
 * (no settings target) and the per-export Alerts tab variant. Type→colour and the TODAY/YESTERDAY/OLDER grouping and
 * "2m ago" stamps are client presentation over real rows. Row titles are
 * composed from the real NotificationType; the body is the server message
 * verbatim. The export's plain 56dp circles (no glyphs) are kept literally.
 */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import {
  BottomTabBar,
  EmptyState,
  ErrorState,
  Icon,
  IconButton,
  InfoBanner,
  LoadingSkeleton,
  Screen,
  ScreenHeader,
  SelectableChip,
  Text,
  TextLink,
} from '@/components/ui';
import { STUDENT_TABS, BUSINESS_TABS } from '@/components/ui/BottomTabBar';
import { apiErrorMessage } from '@/config/api';
import { listNotifications, markAllNotificationsRead, markNotificationRead } from '@/lib/trust-api';
import { goStudentTab, goBusinessTab } from '@/lib/tab-nav';
import { useAuth } from '@/providers/auth-provider';
import { color } from '@/theme/colors';
import { radius } from '@/theme/radius';
import { layout, space } from '@/theme/spacing';
import type { NotificationItem, NotificationType } from '@/types/api';

const PAGE_SIZE = 30;

type FilterKey = 'All' | 'Application' | 'Work Update' | 'Messages' | 'Applicants' | 'Work' | 'Payments';
const FILTERS: FilterKey[] = ['All', 'Application', 'Work Update', 'Messages'];
/** Wireframe 36 business rail. */
const BUSINESS_FILTERS: FilterKey[] = ['All', 'Applicants', 'Work', 'Payments'];

/** Per-export tab variant (approved pattern): this screen owns the Alerts tab. */
const BUSINESS_ALERT_TABS = BUSINESS_TABS.map((tab) =>
  tab.key === 'messages' ? { key: 'alerts', label: 'Alerts', icon: 'bell' as const, activeIcon: 'bellFilled' as const } : tab,
);

const TYPE_COLOR: Record<NotificationType, string> = {
  APPLICATION_SELECTED: color.success,
  APPLICATION_REJECTED: color.danger,
  NEW_APPLICANT: color.primary,
  NEW_MESSAGE: color.primary,
  PAYMENT_RELEASED: color.accent,
  GIG_STATUS_CHANGED: color.warningStrong,
};

const TYPE_TITLE: Record<NotificationType, string> = {
  APPLICATION_SELECTED: 'Application Accepted!',
  APPLICATION_REJECTED: 'Application Update',
  NEW_APPLICANT: 'New Applicant',
  NEW_MESSAGE: 'New Message',
  PAYMENT_RELEASED: 'Payment Received',
  GIG_STATUS_CHANGED: 'Work Update',
};

function titleFor(item: NotificationItem) {
  if (item.type === 'GIG_STATUS_CHANGED') {
    const text = item.message.toLowerCase();
    if (text.includes('revision')) return 'Revision Requested';
    if (text.includes('deadline')) return 'Deadline Approaching';
    if (text.includes('approved')) return 'Work Approved';
    if (text.includes('started')) return 'Work Started';
  }
  return TYPE_TITLE[item.type];
}

function dotColorFor(item: NotificationItem) {
  if (item.type === 'GIG_STATUS_CHANGED' && item.message.toLowerCase().includes('revision')) return color.danger;
  return TYPE_COLOR[item.type];
}

function timeAgo(iso: string) {
  const seconds = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (seconds < 60) return 'now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function dayBucket(iso: string): 'TODAY' | 'YESTERDAY' | 'OLDER' {
  const date = new Date(iso).toDateString();
  if (date === new Date().toDateString()) return 'TODAY';
  if (date === new Date(Date.now() - 86400000).toDateString()) return 'YESTERDAY';
  return 'OLDER';
}

function matches(item: NotificationItem, filter: FilterKey) {
  if (filter === 'All') return true;
  if (filter === 'Application') return item.type === 'APPLICATION_SELECTED' || item.type === 'APPLICATION_REJECTED' || item.type === 'NEW_APPLICANT';
  if (filter === 'Messages') return item.type === 'NEW_MESSAGE';
  if (filter === 'Applicants') return item.type === 'NEW_APPLICANT';
  if (filter === 'Work') return item.type === 'GIG_STATUS_CHANGED' || item.type === 'NEW_MESSAGE' || item.type === 'APPLICATION_SELECTED' || item.type === 'APPLICATION_REJECTED';
  if (filter === 'Payments') return item.type === 'PAYMENT_RELEASED';
  return item.type === 'GIG_STATUS_CHANGED' || item.type === 'PAYMENT_RELEASED';
}

export default function NotificationsScreen() {
  const { token, user } = useAuth();
  const client = useQueryClient();
  const [filter, setFilter] = useState<FilterKey>('All');
  const [page, setPage] = useState(1);
  const [notice, setNotice] = useState<string | null>(null);
  const isBusiness = user?.role === 'BUSINESS';

  const query = useQuery({
    queryKey: ['notifications', page],
    queryFn: () => listNotifications(token!, { page: 1, limit: PAGE_SIZE * page }),
    enabled: !!token,
    refetchInterval: 30000,
  });

  const markAll = useMutation({
    mutationFn: () => markAllNotificationsRead(token!),
    onSuccess: () => client.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const notifications = query.data?.notifications ?? [];
  const total = query.data?.total ?? 0;

  const groups = useMemo(() => {
    const filtered = notifications.filter((item) => matches(item, filter));
    if (isBusiness) {
      // Wireframe 36: unread = "New Activity" washed cards; read rows bucket by day.
      const buckets: { key: string; items: NotificationItem[] }[] = [
        { key: 'New Activity', items: [] },
        { key: 'Earlier Today', items: [] },
        { key: 'Yesterday', items: [] },
        { key: 'Older', items: [] },
      ];
      for (const item of filtered) {
        if (!item.isRead) buckets[0].items.push(item);
        else if (dayBucket(item.createdAt) === 'TODAY') buckets[1].items.push(item);
        else if (dayBucket(item.createdAt) === 'YESTERDAY') buckets[2].items.push(item);
        else buckets[3].items.push(item);
      }
      return buckets.filter((bucket) => bucket.items.length > 0);
    }
    const buckets: { key: string; items: NotificationItem[] }[] = [
      { key: 'TODAY', items: [] },
      { key: 'YESTERDAY', items: [] },
      { key: 'OLDER', items: [] },
    ];
    for (const item of filtered) {
      buckets.find((bucket) => bucket.key === dayBucket(item.createdAt))?.items.push(item);
    }
    return buckets.filter((bucket) => bucket.items.length > 0);
  }, [notifications, filter, isBusiness]);

  const openItem = async (item: NotificationItem) => {
    if (token && !item.isRead) {
      markNotificationRead(token, item.id)
        .then(() => client.invalidateQueries({ queryKey: ['notifications'] }))
        .catch(() => undefined);
    }
    if (item.type === 'NEW_MESSAGE' && item.relatedGigId) {
      router.push(`/(shared)/chat/${item.relatedGigId}` as never);
      return;
    }
    if (item.relatedGigId) {
      router.push(`/(student)/gig/${item.relatedGigId}` as never);
    }
  };

  return (
    <Screen testID="screen-notifications">
      <ScreenHeader
        title="Notifications"
        onBack={() => router.back()}
        trailing={
          isBusiness ? (
            <IconButton
              name="settings"
              accessibilityLabel="Notification settings (flagged)"
              onPress={() => setNotice('Notification settings have no route or backend columns — the gear is kept per the wireframe and flagged, not faked. Mark-all-read stays available under the filter rail.')}
            />
          ) : (
            <IconButton
              name="checkmarkDone"
              accessibilityLabel="Mark all as read"
              onPress={() => token && markAll.mutate()}
              disabled={!token || markAll.isPending || notifications.every((item) => item.isRead)}
            />
          )
        }
      />

      {/* --- Check-mark filter rail (style 2; business set per wireframe 36) --- */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.rail}>
        <Pressable
          accessibilityRole="radio"
          accessibilityLabel="All notifications"
          accessibilityState={{ selected: filter === 'All' }}
          onPress={() => setFilter('All')}
          style={styles.allChip}>
          <Icon name="check" size={15} color={color.textPrimary} />
          <Text variant="calloutStrong">All</Text>
        </Pressable>
        {(isBusiness ? BUSINESS_FILTERS : FILTERS).slice(1).map((item) => (
          <SelectableChip key={item} label={item} selected={filter === item} indicator="none" onToggle={() => setFilter(filter === item ? 'All' : item)} />
        ))}
      </ScrollView>

      {isBusiness && notice ? (
        <View style={styles.noticeWrap}>
          <InfoBanner tone="warning" icon="info" title="Flagged, not faked" description={notice} />
        </View>
      ) : null}
      {isBusiness && token && notifications.some((item) => !item.isRead) ? (
        <View style={styles.markAllRow}>
          <TextLink label="Mark all read" iconRight={null} onPress={() => markAll.mutate()} />
        </View>
      ) : null}

      <ScrollView style={{flex:1}} contentContainerStyle={[styles.list, {flexGrow:1}]} showsVerticalScrollIndicator={false}>
        {!token ? (
          <EmptyState title="Login to see notifications" icon="bell" primaryLabel="Login" onPrimary={() => router.replace('/login' as never)} />
        ) : query.isLoading ? (
          <LoadingSkeleton count={4} variant="row" />
        ) : query.isError ? (
          <ErrorState title="Could not load notifications" description={apiErrorMessage(query.error)} retryLabel="Retry" onRetry={() => query.refetch()} />
        ) : groups.length === 0 ? (
          <EmptyState
            title={filter === 'All' ? "You're all caught up" : `No ${filter.toLowerCase()} notifications`}
            description={filter === 'All' ? 'Application updates, messages and payments will appear here.' : 'Try another filter.'}
            icon="bell"
          />
        ) : (
          groups.map((group) => (
            <View key={group.key}>
              {isBusiness ? (
                <Text variant="overline" tone="secondary" style={styles.bizCaption}>
                  {group.key}
                </Text>
              ) : (
                <View style={styles.dayBar}>
                  <Text variant="overline" tone="secondary" uppercase>
                    {group.key}
                  </Text>
                </View>
              )}
              {group.items.map((item, index) => {
                // Business: unread rows are washed cards; read rows are plain, hairline-separated.
                const washedCard = isBusiness && !item.isRead;
                const rowStyle = isBusiness
                  ? washedCard
                    ? styles.bizCardRow
                    : [styles.bizPlainRow, index > 0 && styles.rowDivider]
                  : [styles.row, index > 0 && styles.rowDivider];
                return (
                  <Pressable
                    key={item.id}
                    accessibilityRole="button"
                    accessibilityLabel={`${titleFor(item)}: ${item.message}`}
                    onPress={() => openItem(item)}
                    style={rowStyle}>
                    <View style={[washedCard || !isBusiness ? styles.dot : styles.dotSmall, { backgroundColor: dotColorFor(item) }]} />
                    <View style={styles.rowCopy}>
                      <View style={styles.rowHead}>
                        <Text variant="calloutStrong" numberOfLines={1} style={item.isRead ? styles.readTitle : styles.unreadTitle}>
                          {titleFor(item)}
                        </Text>
                        <Text variant="captionStrong" tone="secondary">
                          {timeAgo(item.createdAt)}
                        </Text>
                      </View>
                      <Text variant="callout" tone="secondary" numberOfLines={2} style={styles.rowBody}>
                        {item.message}
                      </Text>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          ))
        )}

        {notifications.length < total ? (
          <Pressable accessibilityRole="button" accessibilityLabel="Load older notifications" onPress={() => setPage((value) => value + 1)} style={styles.loadMore}>
            <Text variant="calloutStrong" tone="brand">
              Load older notifications
            </Text>
          </Pressable>
        ) : null}
      </ScrollView>

      <BottomTabBar
        items={isBusiness ? BUSINESS_ALERT_TABS : STUDENT_TABS}
        activeKey={isBusiness ? 'alerts' : 'messages'}
        onSelect={isBusiness ? (key: string) => key !== 'alerts' && goBusinessTab(key) : goStudentTab}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  rail: { gap: space.md, paddingHorizontal: layout.screenGutter, paddingVertical: space.md, alignItems: 'center' },
  allChip: { flexDirection: 'row', alignItems: 'center', gap: space.sm, paddingHorizontal: space.sm },

  list: { paddingBottom: 120 },

  dayBar: {
    backgroundColor: color.skeletonBase,
    paddingHorizontal: layout.screenGutter,
    paddingVertical: space.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: space.md,
    backgroundColor: color.surfaceMuted,
    paddingHorizontal: layout.screenGutter,
    paddingVertical: space.base,
  },
  rowDivider: { borderTopWidth: 1, borderTopColor: color.borderSubtle },
  dot: { width: 56, height: 56, borderRadius: radius.full },
  rowCopy: { flex: 1, gap: space.xs },
  rowHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: space.md },
  readTitle: { color: color.textSecondary },
  unreadTitle: { color: color.textPrimary },
  rowBody: { lineHeight: 20 },

  loadMore: { alignItems: 'center', paddingVertical: space.base },

  /* --- Business (wireframe 36) --- */
  noticeWrap: { paddingHorizontal: layout.screenGutter, paddingBottom: space.sm },
  markAllRow: { alignItems: 'flex-end', paddingHorizontal: layout.screenGutter, paddingBottom: space.sm },
  bizCaption: { paddingHorizontal: layout.screenGutter, paddingTop: space.md, paddingBottom: space.sm },
  bizCardRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: space.md,
    backgroundColor: color.primarySoft,
    borderRadius: 12,
    marginHorizontal: layout.screenGutter,
    marginBottom: space.sm,
    paddingHorizontal: space.base,
    paddingVertical: space.base,
  },
  bizPlainRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: space.md,
    backgroundColor: color.surface,
    paddingHorizontal: layout.screenGutter,
    paddingVertical: space.base,
  },
  dotSmall: { width: 40, height: 40, borderRadius: radius.full },
});
