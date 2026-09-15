import { ActivityIndicator, Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { color } from '@/theme/colors';
import { radius, shadow } from '@/theme/radius';
import { layout, space } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import type { IconName } from '@/theme/icons';
import { Icon } from './Icon';
import { Text } from './Text';

export type ButtonVariant =
  /** Solid brand blue — the single main action on a screen. */
  | 'primary'
  /** White with a blue border + blue label — secondary action. */
  | 'secondary'
  /** Blue-50 wash with blue label — quiet emphasis. */
  | 'soft'
  /** No background, blue label — tertiary / inline action. */
  | 'ghost'
  /** Solid red — destructive confirm. */
  | 'danger'
  /** Red-50 wash with red label — destructive but reversible. */
  | 'dangerSoft'
  /** Solid green — payout / approval confirmations. */
  | 'success';

export type ButtonSize = 'sm' | 'md' | 'lg';

export type ButtonProps = {
  label: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: IconName;
  /** Puts the icon on the trailing edge ("View Gig ›"). */
  iconRight?: IconName;
  loading?: boolean;
  disabled?: boolean;
  /** Stretch to the container width (default true — matches the wireframes). */
  fullWidth?: boolean;
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
  testID?: string;
};

type VariantSkin = {
  background?: string;
  borderColor?: string;
  borderWidth?: number;
  foreground: string;
  pressed: string;
  shadow?: ViewStyle;
};

const SKINS: Record<ButtonVariant, VariantSkin> = {
  // Soft blue glow reserved for the primary CTA only.
  primary: { background: color.primary, foreground: color.primaryOnSolid, pressed: color.primaryPressed, shadow: shadow.primary },
  secondary: { background: color.surface, borderColor: color.primaryBorder, borderWidth: 1.5, foreground: color.primary, pressed: color.primarySoft },
  soft: { background: color.primarySoft, foreground: color.primaryText, pressed: color.primarySoftPressed },
  ghost: { foreground: color.primary, pressed: color.primarySoft },
  danger: { background: color.danger, foreground: color.textInverse, pressed: color.dangerStrong },
  dangerSoft: { background: color.dangerSoft, borderColor: color.dangerBorder, borderWidth: 1, foreground: color.dangerStrong, pressed: color.dangerBorder },
  success: { background: color.success, foreground: color.textInverse, pressed: color.successStrong },
};

const HEIGHTS: Record<ButtonSize, number> = {
  sm: layout.controlSm,
  md: layout.controlMd,
  lg: layout.controlLg,
};

const PADDING: Record<ButtonSize, number> = {
  sm: space.base,
  md: space.lg,
  lg: space.xl,
};

/**
 * The one button. Filled blue for the primary action, outline-blue for the
 * secondary — never mixed arbitrarily on the same screen.
 */
export function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  icon,
  iconRight,
  loading = false,
  disabled = false,
  fullWidth = true,
  accessibilityLabel,
  style,
  testID,
}: ButtonProps) {
  const skin = SKINS[variant];
  const isDisabled = disabled || loading || !onPress;
  const fontSize = size === 'sm' ? typography.buttonSm.fontSize : typography.button.fontSize;
  const iconSize = size === 'sm' ? 15 : size === 'lg' ? 20 : 18;

  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      disabled={isDisabled}
      onPress={onPress}
      style={[styles.touch, fullWidth && styles.fullWidth, style]}>
      {({ pressed }) => (
        <View
          style={[
            styles.base,
            {
              minHeight: HEIGHTS[size],
              paddingHorizontal: PADDING[size],
              borderRadius: size === 'sm' ? radius.md : radius.full,
              backgroundColor: skin.background,
              borderColor: skin.borderColor ?? 'transparent',
              borderWidth: skin.borderWidth ?? 0,
            },
            pressed && { backgroundColor: skin.pressed },
            variant === 'primary' && !pressed && skin.shadow,
            isDisabled && styles.disabled,
            styles.fullWidth,
          ]}>
          {loading ? (
            <ActivityIndicator size="small" color={skin.foreground} />
          ) : (
            <View style={styles.content}>
              {icon ? <Icon name={icon} size={iconSize} color={skin.foreground} /> : null}
              <Text
                variant={size === 'sm' ? 'buttonSm' : 'button'}
                style={{ color: skin.foreground, fontSize }}
                numberOfLines={1}>
                {label}
              </Text>
              {iconRight ? <Icon name={iconRight} size={iconSize} color={skin.foreground} /> : null}
            </View>
          )}
        </View>
      )}
    </Pressable>
  );
}

// ------------------------------------------------------------
// Spec-named aliases — prefer these at call sites so the button
// hierarchy on a screen reads explicitly.
// ------------------------------------------------------------

export type NamedButtonProps = Omit<ButtonProps, 'variant'> & { variant?: Exclude<ButtonVariant, 'primary' | 'secondary'> };

/** Solid filled blue. The main action. */
export function PrimaryButton(props: Omit<ButtonProps, 'variant'>) {
  return <Button {...props} variant="primary" />;
}

/** White with blue outline + blue label. The secondary action. */
export function SecondaryButton(props: NamedButtonProps) {
  return <Button {...props} variant="secondary" />;
}

/** Blue-50 wash. Quiet emphasis. */
export function SoftButton(props: NamedButtonProps) {
  return <Button {...props} variant="soft" />;
}

/** Text-only. Tertiary / inline. */
export function GhostButton(props: NamedButtonProps) {
  return <Button {...props} variant="ghost" />;
}

/** Solid red. Destructive confirm. */
export function DangerButton(props: NamedButtonProps) {
  return <Button {...props} variant="danger" />;
}

/** Small inline text link with an optional trailing chevron. */
export function TextLink({
  label,
  onPress,
  iconRight = 'chevronRight',
  tone = 'brand',
  style,
}: {
  label: string;
  onPress?: () => void;
  iconRight?: IconName | null;
  tone?: 'brand' | 'secondary' | 'danger';
  style?: StyleProp<ViewStyle>;
}) {
  const fg = tone === 'danger' ? color.dangerStrong : tone === 'secondary' ? color.textSecondary : color.primary;
  return (
    <Pressable
      accessibilityRole="link"
      accessibilityLabel={label}
      disabled={!onPress}
      onPress={onPress}
      hitSlop={6}
      style={({ pressed }) => [styles.link, pressed && { opacity: 0.6 }, style]}>
      <Text variant="label" style={{ color: fg }}>
        {label}
      </Text>
      {iconRight ? <Icon name={iconRight} size={14} color={fg} /> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  /* Transparent tap box: always at least a 44pt target, whatever the pill's own
     visual height is (the `sm` pill is 36pt tall). */
  touch: { minHeight: layout.tapTarget, justifyContent: 'center', alignItems: 'center' },
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullWidth: { alignSelf: 'stretch', width: '100%' },
  content: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  disabled: { opacity: 0.45 },
  link: { flexDirection: 'row', alignItems: 'center', gap: 2, paddingVertical: space.xs },
});

export default Button;
