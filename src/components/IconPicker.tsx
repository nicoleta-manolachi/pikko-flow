import BottomSheet from "@/components/BottomSheet";
import { CATEGORY_ICON_GROUPS } from "@/utils/categoryIcons";
import { useColors } from "@/utils/theme";
import { Ionicons } from "@expo/vector-icons";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

type Props = {
  visible: boolean;
  value: string | null;
  onSelect: (icon: string) => void;
  onClose: () => void;
  accentColor: string;
  accentTint: string;
};

export default function IconPicker({
  visible,
  value,
  onSelect,
  onClose,
  accentColor,
  accentTint,
}: Props) {
  const c = useColors();

  return (
    <BottomSheet visible={visible} onClose={onClose} maxHeight="75%">
      <Text style={[s.title, { color: c.text }]}>Choose an icon</Text>
      <ScrollView showsVerticalScrollIndicator={false}>
        {CATEGORY_ICON_GROUPS.map((group) => (
          <View key={group.label} style={s.group}>
            <Text style={[s.groupLabel, { color: c.sub }]}>{group.label}</Text>
            <View style={s.grid}>
              {group.icons.map((icon) => {
                const selected = value === icon;
                return (
                  <Pressable
                    key={icon}
                    onPress={() => {
                      onSelect(icon);
                      onClose();
                    }}
                    style={[
                      s.cell,
                      { backgroundColor: selected ? accentColor : accentTint },
                    ]}
                  >
                    <Ionicons
                      name={icon as any}
                      size={22}
                      color={selected ? "#fff" : accentColor}
                    />
                  </Pressable>
                );
              })}
            </View>
          </View>
        ))}
      </ScrollView>
    </BottomSheet>
  );
}

const s = StyleSheet.create({
  title: { fontSize: 18, fontWeight: "800", marginBottom: 10 },
  group: { marginTop: 14 },
  groupLabel: {
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    marginBottom: 8,
  },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  cell: {
    width: 52,
    height: 52,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
});
