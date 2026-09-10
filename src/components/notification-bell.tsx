import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '@/components/ui';
import { listNotifications } from '@/lib/trust-api';
import { useAuth } from '@/providers/auth-provider';

/**
 * Bell with an unread-count badge. Polling-based (no push infra in Phase 5);
 * place in screen headers so notifications stay persistently accessible.
 */
export function NotificationBell() {
  const { token } = useAuth();
  const query = useQuery({
    queryKey: ['notifications', 'unread'],
    queryFn: () => listNotifications(token!, { page: 1, limit: 1 }),
    enabled: !!token,
    refetchInterval: 15000,
  });
  const unread = query.data?.unreadCount ?? 0;
  return (
    <Pressable style={s.bell} onPress={() => router.push('/notifications' as never)}>
      <Text style={s.icon}>🔔</Text>
      {unread > 0 && (
        <View style={s.badge}>
          <Text style={s.count}>{unread > 99 ? '99+' : unread}</Text>
        </View>
      )}
    </Pressable>
  );
}

const s = StyleSheet.create({
  bell: { padding: 8, position: 'relative' },
  icon: { fontSize: 22 },
  badge: { position: 'absolute', top: 2, right: 0, backgroundColor: colors.danger, borderRadius: 10, minWidth: 20, height: 20, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 5 },
  count: { color: colors.white, fontSize: 11, fontWeight: '800' },
});
