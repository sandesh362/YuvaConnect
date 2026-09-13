import React from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { color } from '@/theme/colors';
import { radius } from '@/theme/radius';
import { layout, space } from '@/theme/spacing';
import { Icon } from './Icon';
import { IconButton } from './Icon';
import { Text } from './Text';

export type SheetProps = {
  visible: boolean;
  onClose: () => void;
  /** Centred title2, per the Filters / Apply sheets. */
  title: string;
  /** Right header action, e.g. blue "Reset". */
  rightAction?: { label: string; onPress: () => void };
  /** Sticky bottom area (the "Show N Gigs" bar). */
  footer?: React.ReactNode;
  children: React.ReactNode;
  contentStyle?: StyleProp<ViewStyle>;
  testID?: string;
};

/**
 * The modal bottom sheet shared by Gig Filters (13) and Apply for Gig (15):
 * dim scrim, radius-24 top corners, X · centred title · right action header,
 * scrollable body and an optional sticky footer.
 */
export function Sheet({ visible, onClose, title, rightAction, footer, children, contentStyle, testID }: SheetProps) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdropWrap}>
        <Pressable style={styles.scrim} accessibilityLabel="Close sheet" onPress={onClose} />
        <View testID={testID} style={styles.sheet}>
          <View style={styles.handle} />
          <View style={styles.header}>
            <IconButton name="close" accessibilityLabel="Close" onPress={onClose} />
            <Text variant="title2" style={styles.title}>
              {title}
            </Text>
            {rightAction ? (
              <Pressable accessibilityRole="button" accessibilityLabel={rightAction.label} onPress={rightAction.onPress} style={styles.rightAction}>
                <Text variant="calloutStrong" tone="brand">
                  {rightAction.label}
                </Text>
              </Pressable>
            ) : (
              <View style={styles.rightAction} />
            )}
          </View>
          <ScrollView contentContainerStyle={[styles.body, contentStyle]} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            {children}
          </ScrollView>
          {footer ? <View style={styles.footer}>{footer}</View> : null}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdropWrap: { flex: 1, justifyContent: 'flex-end' },
  scrim: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15,23,42,0.5)' },
  sheet: {
    backgroundColor: color.surface,
    borderTopLeftRadius: radius['2xl'],
    borderTopRightRadius: radius['2xl'],
    maxHeight: '88%',
    paddingTop: space.md,
  },
  handle: { width: 40, height: 4, borderRadius: radius.full, backgroundColor: color.borderStrong, alignSelf: 'center', marginBottom: space.xs },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: space.sm,
    paddingBottom: space.md,
    borderBottomWidth: 1,
    borderBottomColor: color.borderSubtle,
  },
  title: { flex: 1, textAlign: 'center' },
  rightAction: { minWidth: 56, alignItems: 'flex-end', paddingRight: space.sm },
  body: {
    padding: layout.screenGutter,
    gap: space.base,
    maxWidth: layout.maxContentWidth,
    width: '100%',
    alignSelf: 'center',
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: color.borderSubtle,
    padding: layout.screenGutter,
    backgroundColor: color.surface,
  },
});

export default Sheet;
