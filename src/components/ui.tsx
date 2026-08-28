import { Image, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

export const colors = { navy: '#17324d', blue: '#208aef', pale: '#eef7ff', border: '#d7e1ea', text: '#1d2a35', muted: '#657582', danger: '#c43e3e', white: '#ffffff' };

export function Field({ label, ...props }: React.ComponentProps<typeof TextInput> & { label: string }) {
  return <View style={styles.field}><Text style={styles.label}>{label}</Text><TextInput placeholderTextColor="#84919b" style={[styles.input, props.multiline && styles.multiline]} {...props} /></View>;
}

export function Button({ title, onPress, variant = 'primary', disabled = false }: { title: string; onPress: () => void; variant?: 'primary' | 'outline' | 'danger'; disabled?: boolean }) {
  return <Pressable disabled={disabled} onPress={onPress} style={[styles.button, styles[variant], disabled && styles.disabled]}><Text style={[styles.buttonText, variant !== 'primary' && styles.outlineText]}>{title}</Text></Pressable>;
}

export function VerificationBadge({ verified }: { verified: boolean }) {
  return <View style={[styles.badge, verified ? styles.verified : styles.pending]}><Text style={styles.badgeText}>{verified ? 'Verified' : 'Verification pending'}</Text></View>;
}

export function ImagePreview({ uri, label }: { uri?: string | null; label: string }) {
  return uri ? <Image source={{ uri }} style={styles.image} /> : <View style={styles.imagePlaceholder}><Text style={styles.placeholderText}>{label}</Text></View>;
}

const styles = StyleSheet.create({
  field: { gap: 6 }, label: { color: colors.text, fontSize: 14, fontWeight: '600' }, input: { borderWidth: 1, borderColor: colors.border, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 11, color: colors.text, backgroundColor: colors.white, fontSize: 16 }, multiline: { minHeight: 90, textAlignVertical: 'top' }, button: { borderRadius: 10, minHeight: 46, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 16 }, primary: { backgroundColor: colors.blue }, outline: { backgroundColor: colors.white, borderWidth: 1, borderColor: colors.blue }, danger: { backgroundColor: '#fff1f1', borderWidth: 1, borderColor: '#e5a2a2' }, buttonText: { color: colors.white, fontWeight: '700', fontSize: 16 }, outlineText: { color: colors.blue }, disabled: { opacity: 0.55 }, badge: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999 }, verified: { backgroundColor: '#daf5e4' }, pending: { backgroundColor: '#fff3d1' }, badgeText: { color: colors.text, fontSize: 12, fontWeight: '700' }, image: { width: 112, height: 112, borderRadius: 56, backgroundColor: colors.pale }, imagePlaceholder: { width: 112, height: 112, borderRadius: 56, backgroundColor: colors.pale, alignItems: 'center', justifyContent: 'center', padding: 12 }, placeholderText: { textAlign: 'center', color: colors.muted, fontSize: 12 },
});
