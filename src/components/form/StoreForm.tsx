import { useColors } from "@/utils/theme";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useState } from "react";
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import type { Store } from "@/db/schema";

export type StoreFormValues = {
  name: string;
  imageUri: string | null;
  address: string | null;
};

type Props = {
  initial?: Store;
  submitLabel: string;
  onSubmit: (v: StoreFormValues) => Promise<void> | void;
};

export default function StoreForm({ initial, submitLabel, onSubmit }: Props) {
  const c = useColors();
  const [name, setName] = useState(initial?.name ?? "");
  const [imageUri, setImageUri] = useState<string | null>(
    initial?.imageUri ?? null,
  );
  const [address, setAddress] = useState(initial?.address ?? "");
  const [error, setError] = useState<string | undefined>();
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
        aspect: [4, 3],
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
    Alert.alert("Store photo", undefined, [
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

  async function submit() {
    if (!name.trim()) {
      setError("Name is required");
      return;
    }
    setError(undefined);
    setSaving(true);
    try {
      await onSubmit({
        name: name.trim(),
        imageUri,
        address: address.trim() || null,
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

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
    >
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

        <Text style={[s.label, { color: c.sub }]}>Name *</Text>
        <TextInput
          style={input}
          value={name}
          onChangeText={setName}
          placeholder="e.g. Lidl"
          placeholderTextColor={c.sub}
        />
        {error && (
          <Text style={{ color: c.danger, marginTop: 4 }}>{error}</Text>
        )}

        <Text style={[s.label, { color: c.sub }]}>Address</Text>
        <TextInput
          style={input}
          value={address}
          onChangeText={setAddress}
          placeholder="Strada Ștefan cel Mare, 12"
          placeholderTextColor={c.sub}
        />

        <Pressable
          disabled={saving}
          onPress={submit}
          style={[
            s.save,
            { backgroundColor: c.chilliPaper, opacity: saving ? 0.6 : 1 },
          ]}
        >
          <Text style={{ color: c.offwhite, fontWeight: "700", fontSize: 16 }}>
            {submitLabel}
          </Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  wrap: { padding: 16, paddingBottom: 48 },
  photo: {
    width: "100%",
    height: "auto",
    aspectRatio: 4 / 3,
    borderRadius: 16,
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
  },
  save: {
    marginTop: 28,
    paddingVertical: 14,
    borderRadius: 28,
    alignItems: "center",
  },
});
