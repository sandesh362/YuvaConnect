import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@/components/legacy-ui';
import { apiErrorMessage } from '@/config/api';
import { listNotifications, markAllNotificationsRead, markNotificationRead } from '@/lib/trust-api';
import { useAuth } from '@/providers/auth-provider';
import { NotificationItem } from '@/types/api';

/** Inbox for gig events. Polls while focused; tap marks read and opens the related gig. */
export default function NotificationsScreen() {
  const { token, user } = useAuth();
  const client = useQueryClient();
  const [focused, setFocused] = useState(true);
  useFocusEffect(useCallback(() => {
    setFocused(true);
    return () => setFocused(false);
  }, []));

  const query = useQuery({
    queryKey: ['notifications'],
    queryFn: () => listNotifications(token!, { limit: 20 }),
    enabled: !!token,
    refetchInterval: focused ? 10000 : false,
  });
  const refresh = () => {
    client.invalidateQueries({ queryKey: ['notifications'] });
    client.invalidateQueries({ queryKey: ['notifications', 'unread'] });
  };
  const readAll = useMutation({
    mutationFn: () => markAllNotificationsRead(token!),
    onSuccess: refresh,
    onError: (e) => Alert.alert('Could not mark all read', apiErrorMessage(e)),
  });

  async function openItem(item: NotificationItem) {
    if (!item.isRead) {
      try {
        await markNotificationRead(token!, item.id);
      } catch (e) {
        Alert.alert('Could not mark as read', apiErrorMessage(e));
        return;
      }
      refresh();
    }
    if (item.relatedGigId) {
      router.push((user?.role === 'STUDENT' ? `/(student)/gig/${item.relatedGigId}` : `/(business)/gig/${item.relatedGigId}`) as never);
    }
  }

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView contentContainerStyle={s.content}>
        <View style={s.header}>
          <Pressable onPress={() => router.back()}><Text style={s.back}>‹ Back</Text></Pressable>
          <Text style={s.heading}>Notifications</Text>
          {(query.data?.unreadCount ?? 0) > 0 && (
            <Pressable onPress={() => readAll.mutate()} disabled={readAll.isPending}>
              <Text style={s.action}>{readAll.isPending ? 'Marking…' : 'Mark all read'}</Text>
            </Pressable>
          )}
        </View>
        {query.isError && <Text style={s.error}>{apiErrorMessage(query.error)}</Text>}
        {query.data?.notifications.map((item) => (
          <Pressable key={item.id} style={[s.card, !item.isRead && s.unread]} onPress={() => void openItem(item)}>
            <Text style={[s.message, !item.isRead && s.unreadText]}>{item.message}</Text>
            {item.relatedGig && <Text style={s.gig}>{item.relatedGig.title} · {item.relatedGig.status.replace('_', ' ')}</Text>}
            <Text style={s.time}>{new Date(item.createdAt).toLocaleString()}</Text>
          </Pressable>
        ))}
        {query.data?.notifications.length === 0 && <Text style={s.empty}>You're all caught up — no notifications yet.</Text>}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.pale },
  content: { padding: 20, gap: 12 },
  header: { gap: 6 },
  back: { color: colors.blue, fontWeight: '700' },
  heading: { color: colors.navy, fontSize: 28, fontWeight: '800' },
  action: { color: colors.blue, fontWeight: '800' },
  error: { color: colors.danger },
  card: { backgroundColor: colors.white, borderRadius: 14, padding: 16, gap: 6, opacity: 0.75 },
  unread: { opacity: 1, borderLeftWidth: 4, borderLeftColor: colors.blue },
  message: { color: colors.text, fontSize: 15, lineHeight: 21 },
  unreadText: { fontWeight: '800', color: colors.navy },
  gig: { color: colors.blue, fontWeight: '700' },
  time: { color: colors.muted, fontSize: 12 },
  empty: { color: colors.muted, textAlign: 'center', marginTop: 24 },
});
