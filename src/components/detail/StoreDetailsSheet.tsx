import BottomSheet from "@/components/layouts/BottomSheet";
import { useColors } from "@/utils/theme";
import { Ionicons } from "@expo/vector-icons";
import { ScrollView } from "react-native-gesture-handler";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { Store } from "@/db/schema";
import { ItemRow } from "@/db/queries";

type Props = {
  visible: boolean;
  item: Store | null;
  itemsCount: number;
  storeItems: ItemRow[];
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

export default function StoreDetailsSheet({
  visible,
  item,
  itemsCount,
  storeItems,
  onClose,
  onEdit,
}: Props) {
  const c = useColors();
  if (!item) return null;

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
        </View>
      </View>

      <ScrollView style={{ flex: 1 }}>
        <View style={[s.section]}>
          {item.address ? (
            <Row
              icon="location-outline"
              label="Address"
              value={item.address}
              c={c}
            />
          ) : null}
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
            {storeItems.map((item) => (
              <View
                key={item.id}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginBottom: 8,
                }}
              >
                {/* Image */}
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
                      style={{
                        width: "100%",
                        height: "100%",
                      }}
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
                      {/* optional placeholder icon */}
                    </View>
                  )}
                </View>

                {/* Name + quantity */}
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

                  <Text
                    style={{
                      color: c.sub,
                      fontSize: 13,
                      marginLeft: 10,
                    }}
                  >
                    {item.quantity} {item.unit}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      <Pressable
        onPress={onEdit}
        style={[s.editBtn, { backgroundColor: c.farmGreen }]}
      >
        <Ionicons name="create-outline" size={18} color="#fff" />
        <Text style={{ color: "#fff", fontWeight: "700", fontSize: 15 }}>
          Edit store
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
