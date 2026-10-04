import BottomSheet from "@/components/BottomSheet";
import IconPicker from "@/components/IconPicker";
import { categoryIcon } from "@/utils/categoryIcons";
import { useColors } from "@/utils/theme";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

type Props = {
  visible: boolean;
  onClose: () => void;
  onSubmit: (values: {
    name: string;
    icon: string | null;
  }) => Promise<void> | void;
  initialName?: string;
  initialIcon?: string | null;
  title: string;
  submitLabel: string;
  accentColor: string;
  accentTint: string;
};

export default function CategoryFormModal({
  visible,
  onClose,
  onSubmit,
  initialName = "",
  initialIcon = null,
  title,
  submitLabel,
  accentColor,
  accentTint,
}: Props) {
  const c = useColors();
  const [name, setName] = useState(initialName);
  const [icon, setIcon] = useState<string | null>(initialIcon);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (visible) {
      setName(initialName);
      setIcon(initialIcon);
      setError(undefined);
    }
  }, [visible, initialName, initialIcon]);

  async function handleSubmit() {
    if (!name.trim()) {
      setError("Name is required");
      return;
    }
    setError(undefined);
    setSaving(true);
    try {
      await onSubmit({ name: name.trim(), icon: icon ?? categoryIcon(name) });
      onClose();
    } catch {
      setError("Could not save. That name might already exist.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <BottomSheet visible={visible} onClose={onClose}>
        <Text style={[s.title, { color: c.text }]}>{title}</Text>

        <View style={s.row}>
          <Pressable
            onPress={() => setPickerOpen(true)}
            style={[s.iconBtn, { backgroundColor: accentTint }]}
          >
            <Ionicons
              name={(icon ?? "pricetag-outline") as any}
              size={26}
              color={accentColor}
            />
            <View style={[s.editBadge, { backgroundColor: accentTint }]}>
              <Ionicons name="pencil" size={10} color="#fff" />
            </View>
          </Pressable>
          <TextInput
            style={[
              s.input,
              { backgroundColor: c.card, borderColor: c.border, color: c.text },
            ]}
            value={name}
            onChangeText={setName}
            placeholder="e.g. Snacks"
            placeholderTextColor={c.sub}
            autoFocus
          />
        </View>
        {error && (
          <Text style={{ color: c.danger, marginTop: 8 }}>{error}</Text>
        )}

        <Pressable
          disabled={saving}
          onPress={handleSubmit}
          style={[
            s.save,
            { backgroundColor: accentTint, opacity: saving ? 0.6 : 1 },
          ]}
        >
          <Text style={{ color: accentColor, fontWeight: "700", fontSize: 16 }}>
            {submitLabel}
          </Text>
        </Pressable>
      </BottomSheet>

      <IconPicker
        visible={pickerOpen}
        value={icon}
        onSelect={setIcon}
        onClose={() => setPickerOpen(false)}
        accentColor={accentColor}
        accentTint={accentTint}
      />
    </>
  );
}

const s = StyleSheet.create({
  title: { fontSize: 18, fontWeight: "800", marginBottom: 16 },
  row: { flexDirection: "row", alignItems: "center", gap: 12 },
  iconBtn: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  editBadge: {
    position: "absolute",
    bottom: -2,
    right: -2,
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#fff",
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
  },
  save: {
    marginTop: 24,
    paddingVertical: 14,
    borderRadius: 28,
    alignItems: "center",
  },
});
