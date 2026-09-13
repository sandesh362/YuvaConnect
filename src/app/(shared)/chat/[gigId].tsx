import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@/components/legacy-ui';
import { apiErrorMessage } from '@/config/api';
import { listMessages, sendMessage } from '@/lib/trust-api';
import { useAuth } from '@/providers/auth-provider';
import { Message } from '@/types/api';

/**
 * Gig chat between the assigned student and the business owner.
 * Polling-based (6s) while the screen is focused, paused when unfocused
 * to avoid wasted network use.
 */
export default function ChatScreen() {
  const { gigId } = useLocalSearchParams<{ gigId: string }>();
  const { token, user } = useAuth();
  const client = useQueryClient();
  const [draft, setDraft] = useState('');
  const [history, setHistory] = useState<Message[]>([]);
  const [historyExhausted, setHistoryExhausted] = useState(false);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  const [focused, setFocused] = useState(true);
  useFocusEffect(useCallback(() => {
    setFocused(true);
    return () => setFocused(false);
  }, []));

  const query = useQuery({
    queryKey: ['messages', gigId],
    queryFn: () => listMessages(token!, gigId, { limit: 50 }),
    enabled: !!token && !!gigId,
    refetchInterval: focused ? 6000 : false,
  });

  // Older pages (prepended) + live page, deduped by id in case the live
  // window shifts over already-loaded history.
  const live = query.data?.messages ?? [];
  const seen = new Set<string>();
  const merged = [...history, ...live].filter((m) => (seen.has(m.id) ? false : (seen.add(m.id), true)));
  const canLoadOlder = !historyExhausted && merged.length > 0 && (query.data?.nextCursor != null || history.length > 0);

  async function loadOlder() {
    const oldest = merged[0]?.id;
    if (!oldest || loadingOlder) return;
    setLoadingOlder(true);
    try {
      const page = await listMessages(token!, gigId, { before: oldest, limit: 50 });
      if (page.messages.length === 0 || page.nextCursor == null) setHistoryExhausted(true);
      setHistory((h) => [...page.messages, ...h]);
    } catch (e) {
      Alert.alert('Could not load older messages', apiErrorMessage(e));
    } finally {
      setLoadingOlder(false);
    }
  }

  const send = useMutation({
    mutationFn: () => sendMessage(token!, gigId, draft.trim()),
    onSuccess: () => {
      setDraft('');
      client.invalidateQueries({ queryKey: ['messages', gigId] });
    },
    onError: (e) => Alert.alert('Could not send message', apiErrorMessage(e)),
  });

  return (
    <SafeAreaView style={s.safe}>
      <KeyboardAvoidingView style={s.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <View style={s.header}>
          <Pressable onPress={() => router.back()}><Text style={s.back}>‹ Back</Text></Pressable>
          <Text style={s.heading}>Messages</Text>
        </View>
        {query.isError ? (
          <View style={s.center}><Text style={s.error}>{apiErrorMessage(query.error)}</Text></View>
        ) : (
          <ScrollView
            ref={scrollRef}
            contentContainerStyle={s.list}
            onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
          >
            {canLoadOlder && (
              <Pressable style={s.older} onPress={() => void loadOlder()} disabled={loadingOlder}>
                <Text style={s.olderText}>{loadingOlder ? 'Loading…' : 'Load older messages'}</Text>
              </Pressable>
            )}
            {merged.map((m) => {
              const mine = m.senderId === user?.id;
              return (
                <View key={m.id} style={[s.bubble, mine ? s.mine : s.theirs]}>
                  {!mine && <Text style={s.sender}>{m.sender?.name ?? 'Partner'}</Text>}
                  <Text style={mine ? s.mineText : s.theirsText}>{m.content}</Text>
                  <Text style={s.time}>{new Date(m.createdAt).toLocaleString()}</Text>
                </View>
              );
            })}
            {merged.length === 0 && !query.isPending && <Text style={s.empty}>No messages yet. Say hello!</Text>}
          </ScrollView>
        )}
        <View style={s.composer}>
          <TextInput
            style={s.input}
            value={draft}
            onChangeText={setDraft}
            placeholder="Write a message…"
            placeholderTextColor="#84919b"
            multiline
          />
          <Pressable
            style={[s.send, (!draft.trim() || send.isPending) && s.disabled]}
            disabled={!draft.trim() || send.isPending}
            onPress={() => send.mutate()}
          >
            <Text style={s.sendText}>{send.isPending ? '…' : 'Send'}</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.pale },
  flex: { flex: 1 },
  header: { padding: 16, paddingBottom: 8, gap: 4 },
  back: { color: colors.blue, fontWeight: '700' },
  heading: { color: colors.navy, fontSize: 26, fontWeight: '800' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  error: { color: colors.danger, textAlign: 'center' },
  list: { padding: 16, gap: 10 },
  older: { alignSelf: 'center', padding: 8 },
  olderText: { color: colors.blue, fontWeight: '700' },
  bubble: { maxWidth: '82%', borderRadius: 14, padding: 12, gap: 4 },
  mine: { alignSelf: 'flex-end', backgroundColor: colors.blue },
  theirs: { alignSelf: 'flex-start', backgroundColor: colors.white },
  mineText: { color: colors.white, fontSize: 15, lineHeight: 21 },
  theirsText: { color: colors.text, fontSize: 15, lineHeight: 21 },
  sender: { color: colors.blue, fontWeight: '800', fontSize: 12 },
  time: { fontSize: 11, color: colors.muted },
  empty: { color: colors.muted, textAlign: 'center', marginTop: 24 },
  composer: { flexDirection: 'row', gap: 8, padding: 12, backgroundColor: colors.white, borderTopWidth: 1, borderTopColor: colors.border },
  input: { flex: 1, borderWidth: 1, borderColor: colors.border, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, color: colors.text, fontSize: 15, maxHeight: 110 },
  send: { backgroundColor: colors.blue, borderRadius: 12, paddingHorizontal: 18, alignItems: 'center', justifyContent: 'center' },
  sendText: { color: colors.white, fontWeight: '800' },
  disabled: { opacity: 0.5 },
});
