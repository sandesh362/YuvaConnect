import React, { useState } from 'react';
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { color } from '@/theme/colors';
import { radius } from '@/theme/radius';
import { space } from '@/theme/spacing';
import { Icon } from './Icon';
import { Text } from './Text';

export type AccordionItem = {
  question: string;
  answer: string;
};

export type AccordionProps = {
  items: AccordionItem[];
  /** Index open on first render (the wireframe opens the first question). */
  defaultOpen?: number | null;
  style?: StyleProp<ViewStyle>;
  testID?: string;
};

/**
 * FAQ accordion (Support & Help). One card, hairline-separated rows, a single
 * open row at a time with a minus glyph; closed rows show a plus — exactly
 * the wireframe treatment.
 */
export function Accordion({ items, defaultOpen = 0, style, testID }: AccordionProps) {
  const [open, setOpen] = useState<number | null>(defaultOpen);

  return (
    <View testID={testID} style={[styles.card, style]}>
      {items.map((item, index) => {
        const isOpen = open === index;
        return (
          <View key={item.question} style={[index > 0 && styles.divider]}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={item.question}
              accessibilityState={{ expanded: isOpen }}
              onPress={() => setOpen(isOpen ? null : index)}
              style={styles.row}>
              <Text variant="body" style={styles.question} numberOfLines={2}>
                {item.question}
              </Text>
              <Icon name={isOpen ? 'remove' : 'add'} size={18} color={color.textPrimary} />
            </Pressable>
            {isOpen ? (
              <View style={styles.answerWrap}>
                <Text variant="callout" tone="secondary" style={styles.answer}>
                  {item.answer}
                </Text>
              </View>
            ) : null}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: color.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: color.borderSubtle,
    overflow: 'hidden',
  },
  divider: { borderTopWidth: 1, borderTopColor: color.borderSubtle },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: space.md,
    paddingHorizontal: space.base,
    paddingVertical: space.base,
  },
  question: { flex: 1 },
  answerWrap: {
    paddingHorizontal: space.base,
    paddingBottom: space.base,
    borderTopWidth: 1,
    borderTopColor: color.borderSubtle,
    paddingTop: space.base,
  },
  answer: { lineHeight: 21 },
});

export default Accordion;
