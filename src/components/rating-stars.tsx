import { StyleSheet, Text, View } from 'react-native';
import { colors } from '@/components/ui';

/** Read-only star display. Rounds to the nearest full star; the numeric value carries the precision. */
export function RatingStars({ avgRating, totalRatings }: { avgRating: number; totalRatings: number }) {
  if (!totalRatings) return <Text style={s.none}>No ratings yet</Text>;
  const full = Math.max(0, Math.min(5, Math.round(avgRating)));
  return (
    <View style={s.row}>
      <Text style={s.stars}>{'★'.repeat(full)}{'☆'.repeat(5 - full)}</Text>
      <Text style={s.text}>{avgRating.toFixed(1)} ({totalRatings})</Text>
    </View>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  stars: { color: '#e8a13c', fontSize: 16, fontWeight: '800' },
  text: { color: colors.muted, fontWeight: '700' },
  none: { color: colors.muted },
});
