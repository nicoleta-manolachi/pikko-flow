import BottomSheet from "@/components/layouts/BottomSheet";
import { categoryIcon } from "@/utils/categoryIcons";
import { useColors } from "@/utils/theme";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { ScrollView } from "react-native-gesture-handler";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import type { Category } from "@/db/schema";
import type { ItemRow } from "@/db/queries";

const PREVIEW_ITEMS = 10;

type Props = {
  visible: boolean;
  category: Category | null;
  itemsCount: number;
  categoryItems: ItemRow[];
  accentColor: string;
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

export default function CategoryDetailsSheet({
  visible,
  category,
  itemsCount,
  categoryItems,
  accentColor,
  onClose,
  onEdit,
}: Props) {
  const c = useColors();
  const router = useRouter();
  if (!category) return null;

  const icon = category.icon ?? categoryIcon(category.name);
  const previewItems = categoryItems.slice(0, PREVIEW_ITEMS);
  const hasMore = categoryItems.length > PREVIEW_ITEMS;

  function viewAllInPantry() {
    const id = category!.id;
    onClose();
    router.push({ pathname: "/pantry", params: { categoryId: String(id) } });
  }

  return (
    <BottomSheet visible={visible} onClose={onClose} maxHeight="95%">
      <View style={[s.header, { borderColor: c.border }]}>
        <View style={[s.iconWrap, { backgroundColor: accentColor + "22" }]}>
          <Ionicons name={icon as any} size={32} color={accentColor} />
        </View>
        <Text style={[s.name, { color: c.text }]} numberOfLines={2}>
          {category.name}
        </Text>
      </View>

      <ScrollView style={{ flex: 1 }}>
        <View style={[s.section]}>
          <Row
            icon="file-tray-full-outline"
            label="Total items"
            value={itemsCount.toString()}
            c={c}
          />
          <View
            style={{
              marginTop: 8,
              paddingTop: 18,
              borderTopWidth: 1,
              borderColor: c.border,
            }}
          >
            {previewItems.map((item) => (
              <View
                key={item.id}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginBottom: 8,
                }}
              >
                <View
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: 8,
                    backgroundColor: c.chip,
                    overflow: "hidden",
                    marginRight: 10,
                  }}
                >
                  {item.imageUri ? (
                    <Image
                      source={{ uri: item.imageUri }}
                      style={{ width: "100%", height: "100%" }}
                      resizeMode="cover"
                    />
                  ) : (
                    <View
                      style={{
                        flex: 1,
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Ionicons name="basket-outline" size={20} color={c.sub} />
                    </View>
                  )}
                </View>

                <View
                  style={{
                    flex: 1,
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <Text
                    style={{
                      color: c.text,
                      fontSize: 14,
                      fontWeight: "500",
                      flex: 1,
                    }}
                    numberOfLines={1}
                  >
                    {item.name}
                  </Text>

                  <Text style={{ color: c.sub, fontSize: 13, marginLeft: 10 }}>
                    {item.quantity} {item.unit}
                  </Text>
                </View>
              </View>
            ))}

            {hasMore && (
              <Pressable onPress={viewAllInPantry} style={s.viewAllLink}>
                <Text
                  style={{
                    color: accentColor,
                    fontWeight: "600",
                    fontSize: 14,
                  }}
                >
                  View all {itemsCount} items
                </Text>
                <Ionicons name="arrow-forward" size={16} color={accentColor} />
              </Pressable>
            )}
          </View>
        </View>
      </ScrollView>

      <Pressable
        onPress={onEdit}
        style={[s.editBtn, { backgroundColor: accentColor }]}
      >
        <Ionicons name="create-outline" size={18} color="#fff" />
        <Text style={{ color: "#fff", fontWeight: "700", fontSize: 15 }}>
          Edit category
        </Text>
      </Pressable>
    </BottomSheet>
  );
}

const s = StyleSheet.create({
  header: {
    flexDirection: "row",
    gap: 14,
    alignItems: "center",
    borderBottomWidth: 1,
    paddingBottom: 16,
  },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  name: { fontSize: 24, fontWeight: "800", flex: 1 },
  section: { marginTop: 20 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 8,
  },
  viewAllLink: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 12,
    marginTop: 4,
  },
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
