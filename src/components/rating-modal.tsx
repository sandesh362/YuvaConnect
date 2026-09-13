import { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { Button, colors, Field } from '@/components/legacy-ui';

/** Post-completion prompt to rate the other party. Shown only when the user hasn't rated yet. */
export function RatingModal({ visible, gigTitle, submitting, onSubmit, onClose }: {
  visible: boolean;
  gigTitle: string;
  submitting: boolean;
  onSubmit: (score: number, comment: string) => void;
  onClose: () => void;
}) {
  const [score, setScore] = useState(5);
  const [comment, setComment] = useState('');
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={s.backdrop}>
        <View style={s.card}>
          <Text style={s.heading}>Rate this gig</Text>
          <Text style={s.copy}>{gigTitle}</Text>
          <View style={s.stars}>
            {[1, 2, 3, 4, 5].map((n) => (
              <Pressable key={n} onPress={() => setScore(n)} style={s.starHit}>
                <Text style={[s.star, n <= score && s.starOn]}>★</Text>
              </Pressable>
            ))}
          </View>
          <Field label="Comment (optional)" value={comment} onChangeText={setComment} multiline placeholder="How was working together?" />
          <Button title={submitting ? 'Submitting…' : 'Submit rating'} disabled={submitting} onPress={() => onSubmit(score, comment)} />
          <Button title="Maybe later" variant="outline" onPress={onClose} />
        </View>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(23, 50, 77, 0.55)', alignItems: 'center', justifyContent: 'center', padding: 24 },
  card: { backgroundColor: colors.white, borderRadius: 18, padding: 22, gap: 14, width: '100%' },
  heading: { color: colors.navy, fontSize: 24, fontWeight: '800' },
  copy: { color: colors.muted },
  stars: { flexDirection: 'row', gap: 4 },
  starHit: { padding: 4 },
  star: { fontSize: 34, color: colors.border },
  starOn: { color: '#e8a13c' },
});
