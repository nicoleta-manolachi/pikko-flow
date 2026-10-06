import BottomSheet from "@/components/layouts/BottomSheet";
import PriorityBadge from "@/components/cards/PriorityBadge";
import type { ItemRow } from "@/db/queries";
import { daysLeft, isRunningLow, runOutLabel } from "@/utils/runout";
import { useColors } from "@/utils/theme";
import { Ionicons } from "@expo/vector-icons";
import { ScrollView } from "react-native-gesture-handler";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";

type Props = {
  visible: boolean;
  item: ItemRow | null;
  onClose: () => void;
  onEdit: () => void;
};

function Row({
  icon,
  label,
  value,
  c,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  c: any;
}) {
  return (
    <View style={s.row}>
      <Ionicons name={icon} size={18} color={c.sub} style={{ width: 24 }} />
      <Text style={{ color: c.sub, flex: 1 }} numberOfLines={1}>
        {label}
      </Text>
      <Text
        style={{
          color: c.text,
          fontWeight: "600",
          maxWidth: "75%",
          textAlign: "right",
        }}
      >
        {value}
      </Text>
    </View>
  );
}

export default function ItemDetailsSheet({
  visible,
  item,
  onClose,
  onEdit,
}: Props) {
  const c = useColors();
  if (!item) return null;

  const left = daysLeft(item);
  const low = isRunningLow(item);
  const overdue = left != null && left < 0;
  const alertColor = overdue ? c.danger : c.warn;

  return (
    <BottomSheet visible={visible} onClose={onClose} maxHeight="95%">
      <View style={[s.header, { borderColor: c.border }]}>
        {item.imageUri ? (
          <Image source={{ uri: item.imageUri }} style={s.thumb} />
        ) : null}
        <View
          style={{
            flex: 1,
            gap: 20,
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <Text style={[s.name, { color: c.text }]} numberOfLines={2}>
            {item.name}
          </Text>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <PriorityBadge priority={item.priority} />
            {left != null && low && (
              <Text
                style={{ color: alertColor, fontSize: 12, fontWeight: "600" }}
              >
                <Ionicons name="alert-circle" size={12} /> {runOutLabel(left)}
              </Text>
            )}
          </View>
        </View>
      </View>

      <ScrollView style={{ flex: 1 }}>
        <View style={[s.section]}>
          <Row
            icon="scale-outline"
            label="Quantity"
            value={`${item.quantity} ${item.unit}`}
            c={c}
          />
          {item.categoryName && (
            <Row
              icon="pricetags-outline"
              label="Category"
              value={item.categoryName}
              c={c}
            />
          )}
          {item.stores.length > 0 && (
            <Row
              icon="storefront-outline"
              label="Store"
              value={item.stores.map((st) => st.name).join(", ")}
              c={c}
            />
          )}
          {item.avgConsumeDays != null && (
            <Row
              icon="hourglass-outline"
              label="Usually lasts"
              value={`${item.avgConsumeDays} days`}
              c={c}
            />
          )}
          <Row
            icon="calendar-outline"
            label="Last purchased"
            value={
              item.lastPurchasedAt
                ? item.lastPurchasedAt.toLocaleDateString()
                : "Not set"
            }
            c={c}
          />
          <Row
            icon="cart-outline"
            label="On shopping list"
            value={item.toBuy ? "Yes" : "No"}
            c={c}
          />
        </View>

        {item.notes ? (
          <View style={[s.notes, { backgroundColor: c.chip }]}>
            <Text
              style={{
                color: c.sub,
                fontSize: 12,
                fontWeight: "700",
                textTransform: "uppercase",
                marginBottom: 4,
              }}
            >
              Notes
            </Text>
            <Text style={{ color: c.text }}>{item.notes}</Text>
          </View>
        ) : null}
      </ScrollView>

      <Pressable
        onPress={onEdit}
        style={[s.editBtn, { backgroundColor: c.farmGreen }]}
      >
        <Ionicons name="create-outline" size={18} color="#fff" />
        <Text style={{ color: "#fff", fontWeight: "700", fontSize: 15 }}>
          Edit item
        </Text>
      </Pressable>
    </BottomSheet>
  );
}

const s = StyleSheet.create({
  header: {
    flexDirection: "column",
    gap: 14,
    alignItems: "flex-start",
    borderBottomWidth: 1,
    paddingBottom: 10,
  },
  thumb: {
    width: "100%",
    height: "auto",
    aspectRatio: 4 / 3,
    borderRadius: 14,
  },
  placeholder: { alignItems: "center", justifyContent: "center" },
  name: { fontSize: 28, fontWeight: "800" },
  section: { marginTop: 20 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 8,
  },
  notes: { marginTop: 16, padding: 12, borderRadius: 12 },
  editBtn: {
    marginTop: 24,
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 28,
  },
});
