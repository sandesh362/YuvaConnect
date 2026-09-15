import { useState } from 'react';
import { Pressable, StyleSheet, TextInput, View, type StyleProp, type TextStyle, type ViewStyle } from 'react-native';

import { color } from '@/theme/colors';
import { radius, shadow } from '@/theme/radius';
import { layout, space } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import type { IconName } from '@/theme/icons';
import { Icon, IconButton } from './Icon';
import { Text } from './Text';

export type TextFieldProps = {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  icon?: IconName;
  /** `password` adds the show/hide eye. `textarea` grows to 4 lines. */
  type?: 'text' | 'password' | 'textarea' | 'number' | 'email' | 'phone';
  helperText?: string;
  errorText?: string;
  /** Right-side static affordance, e.g. "₹" prefix or a unit. */
  suffix?: string;
  maxLength?: number;
  optional?: boolean;
  keyboardType?: TextInput['props']['keyboardType'];
  autoCapitalize?: TextInput['props']['autoCapitalize'];
  autoComplete?: TextInput['props']['autoComplete'];
  editable?: boolean;
  multilineRows?: number;
  onFocus?: () => void;
  onBlur?: () => void;
  onSubmitEditing?: () => void;
  style?: StyleProp<ViewStyle>;
  testID?: string;
};

const KEYBOARD: Record<NonNullable<TextFieldProps['type']>, TextInput['props']['keyboardType']> = {
  text: 'default',
  password: 'default',
  textarea: 'default',
  number: 'decimal-pad',
  email: 'email-address',
  phone: 'phone-pad',
};

/**
 * Form control: label above a bordered white input with an optional leading
 * icon, helper/error copy below, and a character counter on textareas.
 * Focus turns the border primary blue.
 */
export function TextField({
  label,
  value,
  onChangeText,
  placeholder,
  icon,
  type = 'text',
  helperText,
  errorText,
  suffix,
  maxLength,
  optional = false,
  keyboardType,
  autoCapitalize,
  autoComplete,
  editable = true,
  multilineRows = 4,
  onFocus,
  onBlur,
  onSubmitEditing,
  style,
  testID,
}: TextFieldProps) {
  const [focused, setFocused] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const multiline = type === 'textarea';
  const invalid = !!errorText;

  const borderColor = invalid ? color.danger : focused ? color.primary : color.border;

  return (
    <View style={[styles.field, style]}>
      <View style={styles.labelRow}>
        <Text variant="label">{label}</Text>
        {optional ? (
          <Text variant="caption" tone="tertiary">
            Optional
          </Text>
        ) : null}
      </View>

      <View
        style={[
          styles.control,
          multiline && styles.controlMultiline,
          { borderColor, backgroundColor: editable ? color.surface : color.surfaceMuted },
          focused && !invalid && styles.controlFocused,
        ]}>
        {icon ? <Icon name={icon} size={18} color={focused ? color.primary : color.iconMuted} /> : null}

        {suffix ? (
          <Text variant="calloutStrong" tone="secondary" style={styles.suffix}>
            {suffix}
          </Text>
        ) : null}

        <TextInput
          testID={testID}
          accessibilityLabel={label}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={color.textTertiary}
          secureTextEntry={type === 'password' && !revealed}
          multiline={multiline}
          numberOfLines={multiline ? multilineRows : undefined}
          textAlignVertical={multiline ? 'top' : 'center'}
          keyboardType={keyboardType ?? KEYBOARD[type]}
          autoCapitalize={autoCapitalize ?? (type === 'email' || type === 'password' ? 'none' : 'sentences')}
          autoComplete={autoComplete}
          editable={editable}
          maxLength={maxLength}
          onFocus={() => {
            setFocused(true);
            onFocus?.();
          }}
          onBlur={() => {
            setFocused(false);
            onBlur?.();
          }}
          onSubmitEditing={onSubmitEditing}
          style={[styles.input, multiline && styles.inputMultiline, !editable && styles.inputDisabled] as StyleProp<TextStyle>}
        />

        {type === 'password' ? (
          <IconButton
            name={revealed ? 'eyeOff' : 'eye'}
            size={18}
            color={color.iconMuted}
            accessibilityLabel={revealed ? 'Hide password' : 'Show password'}
            onPress={() => setRevealed((v) => !v)}
          />
        ) : null}
      </View>

      <View style={styles.footerRow}>
        {invalid ? (
          <View style={styles.messageRow}>
            <Icon name="alertFilled" size={13} color={color.danger} />
            <Text variant="caption" tone="danger">
              {errorText}
            </Text>
          </View>
        ) : helperText ? (
          <Text variant="caption" tone="tertiary">
            {helperText}
          </Text>
        ) : (
          <View />
        )}
        {maxLength && multiline ? (
          <Text variant="caption" tone="tertiary">
            {value.length}/{maxLength}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

/**
 * Tappable "select" control that looks identical to `TextField` — used for
 * dropdowns, date pickers and location pickers on the wireframes.
 */
export function SelectField({
  label,
  value,
  placeholder = 'Select…',
  onPress,
  icon,
  errorText,
  helperText,
  style,
}: {
  label: string;
  value?: string | null;
  placeholder?: string;
  onPress: () => void;
  icon?: IconName;
  errorText?: string;
  helperText?: string;
  style?: StyleProp<ViewStyle>;
}) {
  const invalid = !!errorText;
  return (
    <View style={[styles.field, style]}>
      <Text variant="label">{label}</Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${label}: ${value ?? placeholder}`}
        onPress={onPress}
        style={({ pressed }) => [
          styles.control,
          { borderColor: invalid ? color.danger : color.border },
          pressed && { backgroundColor: color.surfaceMuted },
        ]}>
        {icon ? <Icon name={icon} size={18} color={color.iconMuted} /> : null}
        <Text variant="callout" tone={value ? 'primary' : 'tertiary'} numberOfLines={1} style={styles.selectValue}>
          {value || placeholder}
        </Text>
        <Icon name="chevronDown" size={18} color={color.iconMuted} />
      </Pressable>
      {invalid ? (
        <Text variant="caption" tone="danger">
          {errorText}
        </Text>
      ) : helperText ? (
        <Text variant="caption" tone="tertiary">
          {helperText}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  field: { gap: 6, marginBottom: space.base },
  labelRow: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', gap: space.sm },
  control: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    minHeight: layout.controlMd,
    paddingHorizontal: space.md,
    borderRadius: radius.md,
    borderWidth: 1.5,
    backgroundColor: color.surface,
  },
  controlMultiline: { alignItems: 'flex-start', paddingTop: space.md, paddingBottom: space.md, minHeight: 104 },
  controlFocused: shadow.focus,
  suffix: { minWidth: 14, textAlign: 'center' },
  input: {
    flex: 1,
    paddingVertical: 0,
    fontSize: typography.callout.fontSize,
    lineHeight: typography.callout.lineHeight,
    color: color.textPrimary,
  },
  inputMultiline: { minHeight: 76, textAlignVertical: 'top', paddingTop: 0 },
  inputDisabled: { color: color.textSecondary },
  selectValue: { flex: 1 },
  footerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: space.sm },
  messageRow: { flexDirection: 'row', alignItems: 'center', gap: space.xs },
});

export default TextField;
