import { Ionicons } from '@expo/vector-icons';
import { useMemo } from 'react';
import { Alert, Pressable, SectionList, StyleSheet, Text, View } from 'react-native';
import EmptyState from '@/components/EmptyState';
import PriorityBadge from '@/components/PriorityBadge';
import { useItems } from '@/db/hooks';
import { markBought, setToBuy, type ItemRow } from '@/db/queries';
import { applyView } from '@/utils/listing';
import { isRunningLow } from '@/utils/runout';
import { useColors } from '@/utils/theme';

export default function Shopping() {
  const c = useColors();
  const { items } = useItems();

  // Grouped by store ("Any store" last), so you can walk through one shop at a time.
  const sections = useMemo(() => {
    const sorted = applyView(items.filter((i) => i.toBuy), { search: '', categoryId: null, storeId: null, priority: null, sort: 'store' });
    const groups = new Map<string, ItemRow[]>();
    for (const it of sorted) {
      const key = it.storeName ?? 'Any store';
      groups.set(key, [...(groups.get(key) ?? []), it]);
    }
    return [...groups].map(([title, data]) => ({ title, data }));
  }, [items]);

  const low = useMemo(() => items.filter((i) => !i.toBuy && isRunningLow(i)), [items]);
  const guard = (fn: () => Promise<unknown>) => fn().catch(() => Alert.alert('Something went wrong', 'Please try again.'));

  return (
    <SectionList
      sections={sections}
      keyExtractor={(i) => String(i.id)}
      stickySectionHeadersEnabled={false}
      contentContainerStyle={{ padding: 12, gap: 8, flexGrow: 1 }}
      ListHeaderComponent={
        low.length > 0 ? (
          <Pressable onPress={() => guard(() => Promise.all(low.map((i) => setToBuy(i.id, true))))} style={[s.suggest, { borderColor: c.warn, backgroundColor: c.card }]}>
            <Ionicons name="alert-circle" size={20} color={c.warn} />
            <Text style={{ color: c.text, flex: 1 }}>{low.length} item{low.length > 1 ? 's' : ''} running low. Tap to add to the list.</Text>
          </Pressable>
        ) : null
      }
      renderSectionHeader={({ section }) => (
        <View style={s.header}>
          <Ionicons name="storefront-outline" size={16} color={c.sub} />
          <Text style={{ color: c.sub, fontWeight: '700', textTransform: 'uppercase', fontSize: 12 }}>
            {section.title} · {section.data.length}
          </Text>
        </View>
      )}
      renderItem={({ item }) => (
        <View style={[s.row, { backgroundColor: c.card, borderColor: c.border }]}>
          <Pressable onPress={() => guard(() => markBought(item.id))} hitSlop={8} accessibilityLabel={`Mark ${item.name} as bought`}>
            <Ionicons name="square-outline" size={28} color={c.primary} />
          </Pressable>
          <View style={{ flex: 1 }}>
            <Text style={{ color: c.text, fontSize: 16, fontWeight: '600' }}>{item.name}</Text>
            <Text style={{ color: c.sub }}>{item.quantity} {item.unit}{item.categoryName ? `  ·  ${item.categoryName}` : ''}</Text>
          </View>
          <PriorityBadge priority={item.priority} />
          <Pressable onPress={() => guard(() => setToBuy(item.id, false))} hitSlop={8} accessibilityLabel="Remove from list">
            <Ionicons name="close" size={22} color={c.sub} />
          </Pressable>
        </View>
      )}
      ListEmptyComponent={<EmptyState icon="cart-outline" title="Nothing to buy" subtitle="Tap the cart icon on a pantry item to add it here." />}
    />
  );
}
const s = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: 12, borderWidth: 1 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 12, marginBottom: 2 },
  suggest: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12, borderRadius: 12, borderWidth: 1.5, marginBottom: 8 },
});
