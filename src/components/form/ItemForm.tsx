import { useCategories, useStores } from "@/db/hooks";
import {
  PRIORITIES,
  UNITS,
  type Item,
  type Priority,
  type Unit,
} from "@/db/schema";
import { useColors } from "@/utils/theme";
import { Ionicons } from "@expo/vector-icons";
import { DateTimePickerAndroid } from "@react-native-community/datetimepicker";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import Chip from "../Chip";

export type ItemFormValues = {
  name: string;
  imageUri: string | null;
  quantity: number;
  unit: Unit;
  priority: Priority;
  categoryId: number | null;
  storeId: number | null;
  avgConsumeDays: number | null;
  lastPurchasedAt: Date | null;
  toBuy: boolean;
  notes: string | null;
};

type Props = {
  initial?: Item;
  submitLabel: string;
  onSubmit: (v: ItemFormValues) => Promise<void> | void;
};

export default function ItemForm({ initial, submitLabel, onSubmit }: Props) {
  const c = useColors();
  const router = useRouter();
  const categories = useCategories();
  const stores = useStores();

  const [name, setName] = useState(initial?.name ?? "");
  const [imageUri, setImageUri] = useState<string | null>(
    initial?.imageUri ?? null,
  );
  const [quantity, setQuantity] = useState(String(initial?.quantity ?? 1));
  const [unit, setUnit] = useState<Unit>(initial?.unit ?? "pcs");
  const [priority, setPriority] = useState<Priority>(
    initial?.priority ?? "Medium",
  );
  const [categoryId, setCategoryId] = useState<number | null>(
    initial?.categoryId ?? null,
  );
  const [storeId, setStoreId] = useState<number | null>(
    initial?.storeId ?? null,
  );
  const [days, setDays] = useState(
    initial?.avgConsumeDays ? String(initial.avgConsumeDays) : "",
  );
  const [lastPurchased, setLastPurchased] = useState<Date | null>(
    initial?.lastPurchasedAt ?? null,
  );
  const [toBuy, setToBuy] = useState(initial?.toBuy ?? false);
  const [notes, setNotes] = useState(initial?.notes ?? "");
  const [errors, setErrors] = useState<{
    name?: string;
    quantity?: string;
    days?: string;
  }>({});
  const [saving, setSaving] = useState(false);

  async function pick(source: "camera" | "gallery") {
    try {
      if (source === "camera") {
        const perm = await ImagePicker.requestCameraPermissionsAsync();
        if (!perm.granted)
          return Alert.alert(
            "Camera permission needed",
            "Enable it in system settings to take photos.",
          );
      }
      const opts: ImagePicker.ImagePickerOptions = {
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.6,
      };
      const r =
        source === "camera"
          ? await ImagePicker.launchCameraAsync(opts)
          : await ImagePicker.launchImageLibraryAsync(opts);
      if (!r.canceled) setImageUri(r.assets[0].uri);
    } catch {
      Alert.alert("Could not get the photo", "Please try again.");
    }
  }

  function choosePhoto() {
    Alert.alert("Item photo", undefined, [
      { text: "Take photo", onPress: () => pick("camera") },
      { text: "Choose from gallery", onPress: () => pick("gallery") },
      ...(imageUri
        ? [
            {
              text: "Remove photo",
              style: "destructive" as const,
              onPress: () => setImageUri(null),
            },
          ]
        : []),
      { text: "Cancel", style: "cancel" as const },
    ]);
  }

  function pickDate() {
    DateTimePickerAndroid.open({
      value: lastPurchased ?? new Date(),
      mode: "date",
      maximumDate: new Date(),
      onChange: (_, d) => d && setLastPurchased(d),
    });
  }

  async function submit() {
    const e: typeof errors = {};
    const qty = Number(quantity.replace(",", "."));
    if (!name.trim()) e.name = "Name is required";
    if (!Number.isFinite(qty) || qty <= 0)
      e.quantity = "Enter a number greater than 0";
    const d = days.trim() ? Number(days) : null;
    if (d != null && (!Number.isInteger(d) || d < 1))
      e.days = "Enter whole days (1 or more)";
    setErrors(e);
    if (Object.keys(e).length) return;

    setSaving(true);
    try {
      await onSubmit({
        name: name.trim(),
        imageUri,
        quantity: qty,
        unit,
        priority,
        categoryId,
        storeId,
        avgConsumeDays: d,
        lastPurchasedAt: lastPurchased,
        toBuy,
        notes: notes.trim() || null,
      });
    } catch {
      Alert.alert("Could not save", "Something went wrong. Please try again.");
      setSaving(false);
    }
  }

  const input = [
    s.input,
    { backgroundColor: c.card, borderColor: c.border, color: c.text },
  ];

  function Section({
    icon,
    label,
    children,
  }: {
    icon: keyof typeof Ionicons.glyphMap;
    label: string;
    children: React.ReactNode;
  }) {
    return (
      <View style={s.section}>
        <View style={s.sectionHeader}>
          <Ionicons name={icon} size={15} color={c.sub} />
          <Text style={[s.sectionLabel, { color: c.sub }]}>{label}</Text>
        </View>
        {children}
      </View>
    );
  }

  function Err({ msg }: { msg?: string }) {
    return msg ? (
      <Text style={{ color: c.danger, marginTop: 6, fontSize: 13 }}>{msg}</Text>
    ) : null;
  }

  return (
    <ScrollView
      contentContainerStyle={s.wrap}
      keyboardShouldPersistTaps="handled"
    >
      <Pressable
        onPress={choosePhoto}
        style={[s.photo, { backgroundColor: c.chip, borderColor: c.border }]}
      >
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={StyleSheet.absoluteFill} />
        ) : (
          <View style={{ alignItems: "center" }}>
            <Ionicons name="camera-outline" size={28} color={c.sub} />
            <Text style={{ color: c.sub, fontSize: 13, marginTop: 4 }}>
              Add photo
            </Text>
          </View>
        )}
      </Pressable>

      {/* Basics */}
      <Section icon="pricetag-outline" label="Item">
        <TextInput
          style={input}
          value={name}
          onChangeText={setName}
          placeholder="e.g. Milk"
          placeholderTextColor={c.sub}
        />
        <Err msg={errors.name} />
      </Section>

      <Section icon="scale-outline" label="Quantity">
        <TextInput
          style={input}
          value={quantity}
          onChangeText={setQuantity}
          keyboardType="decimal-pad"
        />
        <Err msg={errors.quantity} />
        <View style={s.row}>
          {UNITS.map((u) => (
            <Chip
              key={u}
              label={u}
              selected={u === unit}
              onPress={() => setUnit(u)}
              activeBg={c.farmGreen}
              activeText={c.card}
            />
          ))}
        </View>
      </Section>

      <Section icon="flag-outline" label="Priority">
        <View style={s.row}>
          {PRIORITIES.map((p) => (
            <Chip
              key={p}
              label={p}
              selected={p === priority}
              onPress={() => setPriority(p)}
              activeBg={c.farmGreen}
              activeText={c.card}
            />
          ))}
        </View>
      </Section>

      {/* Organization */}
      <Section icon="grid-outline" label="Category">
        <View style={s.row}>
          <Chip
            label="None"
            selected={categoryId == null}
            onPress={() => setCategoryId(null)}
            activeBg={c.farmGreen}
            activeText={c.card}
          />
          {categories.map((cat) => (
            <Chip
              key={cat.id}
              label={cat.name}
              selected={cat.id === categoryId}
              onPress={() => setCategoryId(cat.id)}
              activeBg={c.farmGreen}
              activeText={c.card}
            />
          ))}
        </View>
        <Pressable
          onPress={() => router.push("/categories")}
          style={s.manageLink}
        >
          <Ionicons name="add-circle-outline" size={15} color={c.farmGreen} />
          <Text style={{ color: c.farmGreen, fontSize: 13, fontWeight: "600" }}>
            Manage categories
          </Text>
        </Pressable>
      </Section>

      <Section icon="storefront-outline" label="Store">
        <View style={s.row}>
          <Chip
            label="Any"
            selected={storeId == null}
            onPress={() => setStoreId(null)}
            activeBg={c.farmGreen}
            activeText={c.card}
          />
          {stores.map((st) => (
            <Chip
              key={st.id}
              label={st.name}
              selected={st.id === storeId}
              onPress={() => setStoreId(st.id)}
              activeBg={c.farmGreen}
              activeText={c.card}
            />
          ))}
        </View>
        <Pressable onPress={() => router.push("/stores")} style={s.manageLink}>
          <Ionicons name="add-circle-outline" size={15} color={c.farmGreen} />
          <Text style={{ color: c.farmGreen, fontSize: 13, fontWeight: "600" }}>
            Manage stores
          </Text>
        </Pressable>
      </Section>

      {/* Consumption tracking */}
      <Section icon="hourglass-outline" label="Usually lasts (days)">
        <TextInput
          style={input}
          value={days}
          onChangeText={setDays}
          keyboardType="number-pad"
          placeholder="e.g. 7"
          placeholderTextColor={c.sub}
        />
        <Err msg={errors.days} />
      </Section>

      <Section icon="calendar-outline" label="Last purchased">
        <View style={s.row}>
          <Pressable
            onPress={pickDate}
            style={[...input, { flex: 1, justifyContent: "center" }]}
          >
            <Text style={{ color: lastPurchased ? c.text : c.sub }}>
              {lastPurchased ? lastPurchased.toLocaleDateString() : "Not set"}
            </Text>
          </Pressable>
          <Chip
            label="Today"
            onPress={() => setLastPurchased(new Date())}
            activeBg={c.farmGreen}
            activeText={c.card}
          />
          <Chip
            label="Clear"
            onPress={() => setLastPurchased(null)}
            activeBg={c.farmGreen}
            activeText={c.card}
          />
        </View>
      </Section>

      {/* Shopping */}
      <View
        style={[
          s.switchRow,
          { backgroundColor: c.card, borderColor: c.border },
        ]}
      >
        <View style={{ flex: 1 }}>
          <Text style={{ color: c.text, fontSize: 15, fontWeight: "600" }}>
            Add to shopping list
          </Text>
          <Text style={{ color: c.sub, fontSize: 13, marginTop: 2 }}>
            Shows up on the To Buy tab
          </Text>
        </View>
        <Switch
          value={toBuy}
          onValueChange={setToBuy}
          trackColor={{ true: c.farmGreen800 }}
          thumbColor={toBuy ? c.farmGreen : undefined}
        />
      </View>

      <Section icon="document-text-outline" label="Notes">
        <TextInput
          style={[...input, { height: 90, textAlignVertical: "top" }]}
          value={notes}
          onChangeText={setNotes}
          multiline
          placeholder="Brand, preferences, etc."
          placeholderTextColor={c.sub}
        />
      </Section>

      <Pressable
        disabled={saving}
        onPress={submit}
        style={[
          s.save,
          { backgroundColor: c.farmGreen, opacity: saving ? 0.6 : 1 },
        ]}
      >
        <Text
          style={{ color: c.card, fontWeight: "700", fontSize: 16 }}
        >
          {submitLabel}
        </Text>
      </Pressable>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  wrap: { padding: 16, paddingBottom: 48 },
  photo: {
    height: 140,
    width: 140,
    borderRadius: 16,
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    borderWidth: 1,
    marginBottom: 8,
  },
  section: { marginTop: 22 },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 8,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    marginRight: 8,
  },
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    rowGap: 8,
    marginTop: 8,
  },
  manageLink: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 10,
  },
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 22,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  save: {
    marginTop: 28,
    paddingVertical: 14,
    borderRadius: 28,
    alignItems: "center",
  },
});
