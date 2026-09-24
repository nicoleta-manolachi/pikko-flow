import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import type { SortKey } from '@/store/uiStore';
import { useColors } from '@/utils/theme';

export const SORT_LABELS: Record<SortKey, string> = {
  runout: 'Running out soonest',
  name: 'Name',
  priority: 'Priority',
  category: 'Category',
  store: 'Store',
  added: 'Date added',
};

export default function SortMenu({ value, onChange }: { value: SortKey; onChange: (s: SortKey) => void }) {
  const c = useColors();
  const [open, setOpen] = useState(false);
  return (
    <>
      <Pressable onPress={() => setOpen(true)} style={[s.btn, { backgroundColor: c.chip }]}>
        <Ionicons name="swap-vertical" size={16} color={c.text} />
        <Text style={{ color: c.text, fontSize: 13 }}>{SORT_LABELS[value]}</Text>
      </Pressable>
      <Modal transparent visible={open} animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={s.backdrop} onPress={() => setOpen(false)}>
          <View style={[s.sheet, { backgroundColor: c.card }]}>
            <Text style={[s.title, { color: c.sub }]}>Sort by</Text>
            {(Object.keys(SORT_LABELS) as SortKey[]).map((k) => (
              <Pressable key={k} style={s.row} onPress={() => { onChange(k); setOpen(false); }}>
                <Text style={{ color: c.text, fontSize: 16, flex: 1 }}>{SORT_LABELS[k]}</Text>
                {k === value && <Ionicons name="checkmark" size={20} color={c.primary} />}
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>
    </>
  );
}
const s = StyleSheet.create({
  btn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 16, marginRight: 8 },
  backdrop: { flex: 1, backgroundColor: '#0008', justifyContent: 'center', padding: 32 },
  sheet: { borderRadius: 16, padding: 8 },
  title: { fontSize: 12, fontWeight: '700', padding: 12, textTransform: 'uppercase' },
  row: { flexDirection: 'row', alignItems: 'center', padding: 14 },
});
