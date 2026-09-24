import { useCategories, useStores } from "@/db/hooks";
import { addCategory, addStore } from "@/db/queries";
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
import Chip from "./Chip";

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
  const categories = useCategories();
  const stores = useStores();
  const [name, setName] = useState(initial?.name ?? "");
  const [imageUri, setImageUri] = useState<string | null>(
    initial?.imageUri ?? null,
  );
  const [quantity, setQuantity] = useState(String(initial?.quantity ?? 1));
  const [unit, setUnit] = useState<Unit>(initial?.unit ?? "pcs");
  const [priority, setPriority] = useState<Priority>(
    initial?.priority ?? "medium",
  );
  const [categoryId, setCategoryId] = useState<number | null>(
    initial?.categoryId ?? null,
  );
  const [storeId, setStoreId] = useState<number | null>(
    initial?.storeId ?? null,
  );
  const [newStore, setNewStore] = useState("");
  const [days, setDays] = useState(
    initial?.avgConsumeDays ? String(initial.avgConsumeDays) : "",
  );
  const [lastPurchased, setLastPurchased] = useState<Date | null>(
    initial?.lastPurchasedAt ?? null,
  );
  const [toBuy, setToBuy] = useState(initial?.toBuy ?? false);
  const [notes, setNotes] = useState(initial?.notes ?? "");
  const [newCat, setNewCat] = useState("");
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

  async function createCategory() {
    if (!newCat.trim()) return;
    try {
      setCategoryId(await addCategory(newCat));
      setNewCat("");
    } catch {
      Alert.alert("Could not add category");
    }
  }

  async function createStore() {
    if (!newStore.trim()) return;
    try {
      setStoreId(await addStore(newStore));
      setNewStore("");
    } catch {
      Alert.alert("Could not add store");
    }
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
  const Label = ({ children }: { children: string }) => (
    <Text style={[s.label, { color: c.sub }]}>{children}</Text>
  );
  const Err = ({ msg }: { msg?: string }) =>
    msg ? <Text style={{ color: c.danger, marginTop: 4 }}>{msg}</Text> : null;

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
            <Ionicons name="camera-outline" size={32} color={c.sub} />
            <Text style={{ color: c.sub }}>Add photo</Text>
          </View>
        )}
      </Pressable>

      <Label>Name *</Label>
      <TextInput
        style={input}
        value={name}
        onChangeText={setName}
        placeholder="e.g. Milk"
        placeholderTextColor={c.sub}
      />
      <Err msg={errors.name} />

      <Label>Quantity</Label>
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
          />
        ))}
      </View>

      <Label>Priority</Label>
      <View style={s.row}>
        {PRIORITIES.map((p) => (
          <Chip
            key={p}
            label={p}
            selected={p === priority}
            onPress={() => setPriority(p)}
          />
        ))}
      </View>

      <Label>Category</Label>
      <View style={s.row}>
        <Chip
          label="None"
          selected={categoryId == null}
          onPress={() => setCategoryId(null)}
        />
        {categories.map((cat) => (
          <Chip
            key={cat.id}
            label={cat.name}
            selected={cat.id === categoryId}
            onPress={() => setCategoryId(cat.id)}
          />
        ))}
      </View>
      <View style={[s.row, { marginTop: 8 }]}>
        <TextInput
          style={[...input, { flex: 1 }]}
          value={newCat}
          onChangeText={setNewCat}
          placeholder="New category"
          placeholderTextColor={c.sub}
          onSubmitEditing={createCategory}
        />
        <Pressable
          onPress={createCategory}
          style={[s.addBtn, { backgroundColor: c.primary }]}
        >
          <Ionicons name="add" size={22} color={c.onPrimary} />
        </Pressable>
      </View>

      <Label>Store</Label>
      <View style={s.row}>
        <Chip
          label="Any"
          selected={storeId == null}
          onPress={() => setStoreId(null)}
        />
        {stores.map((st) => (
          <Chip
            key={st.id}
            label={st.name}
            selected={st.id === storeId}
            onPress={() => setStoreId(st.id)}
          />
        ))}
      </View>
      <View style={[s.row, { marginTop: 8 }]}>
        <TextInput
          style={[...input, { flex: 1 }]}
          value={newStore}
          onChangeText={setNewStore}
          placeholder="New store (e.g. Lidl)"
          placeholderTextColor={c.sub}
          onSubmitEditing={createStore}
        />
        <Pressable
          onPress={createStore}
          style={[s.addBtn, { backgroundColor: c.primary }]}
        >
          <Ionicons name="add" size={22} color={c.onPrimary} />
        </Pressable>
      </View>

      <Label>Usually lasts (days)</Label>
      <TextInput
        style={input}
        value={days}
        onChangeText={setDays}
        keyboardType="number-pad"
        placeholder="e.g. 7"
        placeholderTextColor={c.sub}
      />
      <Err msg={errors.days} />

      <Label>Last purchased</Label>
      <View style={s.row}>
        <Pressable
          onPress={pickDate}
          style={[...input, { flex: 1, justifyContent: "center" }]}
        >
          <Text style={{ color: lastPurchased ? c.text : c.sub }}>
            {lastPurchased ? lastPurchased.toLocaleDateString() : "Not set"}
          </Text>
        </Pressable>
        <Chip label="Today" onPress={() => setLastPurchased(new Date())} />
        <Chip label="Clear" onPress={() => setLastPurchased(null)} />
      </View>

      <View style={[s.row, { justifyContent: "space-between", marginTop: 16 }]}>
        <Text style={{ color: c.text, fontSize: 16 }}>
          Add to shopping list
        </Text>
        <Switch
          value={toBuy}
          onValueChange={setToBuy}
          trackColor={{ true: c.primary }}
        />
      </View>

      <Label>Notes</Label>
      <TextInput
        style={[...input, { height: 90, textAlignVertical: "top" }]}
        value={notes}
        onChangeText={setNotes}
        multiline
        placeholder="Brand, store, etc."
        placeholderTextColor={c.sub}
      />

      <Pressable
        disabled={saving}
        onPress={submit}
        style={[
          s.save,
          { backgroundColor: c.primary, opacity: saving ? 0.6 : 1 },
        ]}
      >
        <Text style={{ color: c.onPrimary, fontWeight: "700", fontSize: 16 }}>
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
  },
  label: {
    marginTop: 16,
    marginBottom: 6,
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
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
  addBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
  },
  save: {
    marginTop: 28,
    paddingVertical: 14,
    borderRadius: 28,
    alignItems: "center",
  },
});
