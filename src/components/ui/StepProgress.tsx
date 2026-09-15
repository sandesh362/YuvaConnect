import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { color } from '@/theme/colors';
import { radius } from '@/theme/radius';
import { space } from '@/theme/spacing';

export type StepProgressProps = {
  /** Total segments — the onboarding flows use 5, Post-a-Gig uses 4. */
  total?: number;
  /** 1-based count of filled segments. */
  current: number;
  style?: StyleProp<ViewStyle>;
  testID?: string;
};

/**
 * The segmented step bar under the header of every onboarding / wizard screen
 * (Student Verification, Skill Selection, Location & Availability, Apply for
 * Gig, Business Verification, Post a New Gig). Filled = solid primary,
 * remaining = slate-200; equal-width segments with a small gap.
 */
export function StepProgress({ total = 5, current, style, testID }: StepProgressProps) {
  return (
    <View
      testID={testID}
      accessibilityRole="progressbar"
      accessibilityLabel={`Step ${Math.min(current, total)} of ${total}`}
      style={[styles.row, style]}>
      {Array.from({ length: total }, (_, index) => (
        <View
          key={index}
          style={[styles.segment, index < current ? styles.filled : styles.pending]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: space.md },
  segment: { flex: 1, height: 5, borderRadius: radius.full },
  filled: { backgroundColor: color.primary },
  pending: { backgroundColor: color.skeletonBase },
});

export default StepProgress;
