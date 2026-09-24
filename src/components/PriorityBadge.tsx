import { StyleSheet, Text, View } from 'react-native';
import type { Priority } from '@/db/schema';
import { priorityColor } from '@/utils/theme';

export default function PriorityBadge({ priority }: { priority: Priority }) {
  const color = priorityColor[priority];
  return (
    <View style={[s.badge, { backgroundColor: color + '26', borderColor: color }]}>
      <Text style={[s.text, { color }]}>{priority.toUpperCase()}</Text>
    </View>
  );
}
const s = StyleSheet.create({
  badge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10, borderWidth: 1 },
  text: { fontSize: 10, fontWeight: '700', letterSpacing: 0.5 },
});
