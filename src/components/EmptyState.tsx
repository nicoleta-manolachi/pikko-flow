import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useColors } from '@/utils/theme';

type Props = { icon: keyof typeof Ionicons.glyphMap; title: string; subtitle: string; actionLabel?: string; onAction?: () => void };

export default function EmptyState({ icon, title, subtitle, actionLabel, onAction }: Props) {
  const c = useColors();
  return (
    <View style={s.wrap}>
      <Ionicons name={icon} size={56} color={c.sub} />
      <Text style={[s.title, { color: c.text }]}>{title}</Text>
      <Text style={[s.sub, { color: c.sub }]}>{subtitle}</Text>
      {actionLabel && onAction && (
        <Pressable onPress={onAction} style={[s.btn, { backgroundColor: c.primary }]}>
          <Text style={{ color: c.onPrimary, fontWeight: '600' }}>{actionLabel}</Text>
        </Pressable>
      )}
    </View>
  );
}
const s = StyleSheet.create({
  wrap: { alignItems: 'center', padding: 32, marginTop: 60 },
  title: { fontSize: 18, fontWeight: '700', marginTop: 12 },
  sub: { textAlign: 'center', marginTop: 6 },
  btn: { marginTop: 18, paddingHorizontal: 20, paddingVertical: 12, borderRadius: 24 },
});
