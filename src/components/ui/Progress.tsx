import React from 'react';
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { color } from '@/theme/colors';
import { radius } from '@/theme/radius';
import { space } from '@/theme/spacing';
import type { IconName } from '@/theme/icons';
import { Icon } from './Icon';
import { Text } from './Text';

export type ProgressTone = 'brand' | 'success' | 'warning' | 'danger';

const FILLS: Record<ProgressTone, string> = {
  brand: color.primary,
  success: color.success,
  warning: color.warning,
  danger: color.danger,
};

/** Determinate progress bar — application progress, upload progress, goal meter. */
export function ProgressBar({
  /** 0–100 */
  value,
  tone = 'brand',
  height = 8,
  label,
  showValue = false,
  style,
}: {
  value: number;
  tone?: ProgressTone;
  height?: number;
  label?: string;
  showValue?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const clamped = Math.max(0, Math.min(100, Math.round(value)));
  return (
    <View style={[styles.wrapper, style]}>
      {label || showValue ? (
        <View style={styles.headerRow}>
          {label ? (
            <Text variant="caption" tone="secondary" numberOfLines={1} style={styles.headerLabel}>
              {label}
            </Text>
          ) : (
            <View />
          )}
          {showValue ? (
            <Text variant="caption" style={{ color: FILLS[tone], fontWeight: '700' }}>
              {clamped}%
            </Text>
          ) : null}
        </View>
      ) : null}
      <View
        accessibilityRole="progressbar"
        accessibilityValue={{ min: 0, max: 100, now: clamped }}
        style={[styles.track, { height, borderRadius: height / 2 }]}>
        <View style={[styles.fill, { width: `${clamped}%`, backgroundColor: FILLS[tone], borderRadius: height / 2 }]} />
      </View>
    </View>
  );
}

// ------------------------------------------------------------
// Milestone stepper — the gig work lifecycle
// ------------------------------------------------------------

export type MilestoneStatus = 'done' | 'current' | 'pending';

export type Milestone = {
  key: string;
  label: string;
  status: MilestoneStatus;
  /** Optional timestamp under the label ("12 Sep"). */
  meta?: string;
  icon?: IconName;
};

/**
 * Milestone stepper for the gig lifecycle. Completed steps get a filled blue
 * tick, the current step a blue ring, pending steps stay gray. Drives both
 * Active Work Tracker screens (student vertical, business horizontal).
 */
export function MilestoneStepper({
  milestones,
  orientation = 'vertical',
  connectors = true,
  style,
}: {
  milestones: Milestone[];
  orientation?: 'vertical' | 'horizontal';
  /** The student tracker export (wireframe 17) draws NO connector lines. */
  connectors?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  if (orientation === 'horizontal') {
    return (
      <View style={[styles.hRow, style]}>
        {milestones.map((step, index) => {
          const isFirst = index === 0;
          const isLast = index === milestones.length - 1;
          const prevDone = index > 0 && milestones[index - 1].status === 'done';
          return (
            <View key={step.key} style={styles.hCol}>
              <View style={styles.hNodeRow}>
                {connectors ? <View style={[styles.hRail, isFirst && styles.hRailHidden, prevDone && styles.railDone]} /> : null}
                <StepNode step={step} />
                {connectors ? <View style={[styles.hRail, isLast && styles.hRailHidden, step.status === 'done' && styles.railDone]} /> : null}
              </View>
              <Text
                variant="caption"
                tone={step.status === 'pending' ? 'tertiary' : step.status === 'current' ? 'brand' : 'primary'}
                numberOfLines={2}
                style={[styles.hLabel, { fontSize: 10, lineHeight: 13 }]}>
                {step.label}
              </Text>
            </View>
          );
        })}
      </View>
    );
  }

  return (
    <View style={style}>
      {milestones.map((step, index) => (
        <View key={step.key} style={styles.vRow}>
          <View style={styles.vRailColumn}>
            <StepNode step={step} />
            {index < milestones.length - 1 ? (
              <View style={[styles.vRail, step.status === 'done' ? styles.railDone : styles.railIdle]} />
            ) : null}
          </View>
          <View style={styles.vBody}>
            <Text variant="calloutStrong" tone={step.status === 'pending' ? 'tertiary' : 'primary'}>
              {step.label}
            </Text>
            {step.meta ? (
              <Text variant="caption" tone="tertiary" style={{ marginTop: 1 }}>
                {step.meta}
              </Text>
            ) : null}
          </View>
        </View>
      ))}
    </View>
  );
}

function StepNode({ step }: { step: Milestone }) {
  if (step.status === 'done') {
    return (
      <View style={[styles.node, styles.nodeDone]}>
        <Icon name="check" size={13} color={color.textInverse} />
      </View>
    );
  }
  if (step.status === 'current') {
    return (
      <View style={[styles.node, styles.nodeCurrent]}>
        <View style={styles.nodeCurrentDot} />
      </View>
    );
  }
  return <View style={[styles.node, styles.nodePending]} />;
}

// ------------------------------------------------------------
// Checklist — deliverable submission requirements
// ------------------------------------------------------------

export function ChecklistItem({
  label,
  checked,
  onToggle,
  disabled,
}: {
  label: string;
  checked: boolean;
  onToggle?: () => void;
  disabled?: boolean;
}) {
  const isDisabled = disabled || !onToggle;
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityLabel={label}
      accessibilityState={{ checked, disabled: isDisabled }}
      disabled={isDisabled}
      onPress={onToggle}
      style={({ pressed }) => [styles.checkRow, pressed && !isDisabled ? { opacity: 0.7 } : null, isDisabled && { opacity: 0.6 }]}>
      <View style={[styles.checkbox, checked && styles.checkboxOn]}>
        {checked ? <Icon name="check" size={13} color={color.textInverse} /> : null}
      </View>
      <Text variant="callout" tone={checked ? 'tertiary' : 'primary'} style={[styles.checkboxLabel, checked && styles.strike]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: 6 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: space.sm },
  headerLabel: { flex: 1 },
  track: { width: '100%', backgroundColor: color.surfaceMuted, overflow: 'hidden' },
  fill: { height: '100%' },

  // vertical stepper
  vRow: { flexDirection: 'row', gap: space.md },
  vRailColumn: { alignItems: 'center', width: 24 },
  vRail: { width: 2, flex: 1, minHeight: 22, marginVertical: 4 },
  vBody: { flex: 1, paddingBottom: space.lg },

  // horizontal stepper
  hRow: { flexDirection: 'row', alignItems: 'flex-start' },
  hCol: { flex: 1, alignItems: 'center' },
  hNodeRow: { flexDirection: 'row', alignItems: 'center', alignSelf: 'stretch' },
  hRail: { flex: 1, height: 2, backgroundColor: color.border },
  hRailHidden: { backgroundColor: 'transparent' },
  hLabel: { textAlign: 'center', marginTop: 6, paddingHorizontal: 2 },

  railDone: { backgroundColor: color.primary },
  railIdle: { backgroundColor: color.border },

  node: { width: 24, height: 24, borderRadius: radius.full, alignItems: 'center', justifyContent: 'center' },
  nodeDone: { backgroundColor: color.primary },
  nodeCurrent: { backgroundColor: color.surface, borderWidth: 2, borderColor: color.primary },
  nodeCurrentDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: color.primary },
  nodePending: { backgroundColor: color.surface, borderWidth: 2, borderColor: color.border },

  // checklist
  checkRow: { flexDirection: 'row', alignItems: 'center', gap: space.md, paddingVertical: space.sm },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: radius.sm,
    borderWidth: 1.5,
    borderColor: color.borderStrong,
    backgroundColor: color.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxOn: { backgroundColor: color.primary, borderColor: color.primary },
  checkboxLabel: { flex: 1 },
  strike: { textDecorationLine: 'line-through' },
});

export default ProgressBar;
