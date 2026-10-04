import { Ionicons } from "@expo/vector-icons";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Pressable, Text, View } from "react-native";
import { createStore, deleteStore, getStore, updateStore } from "@/db/queries";
import type { Store } from "@/db/schema";
import { deleteImageFile, persistImage } from "@/utils/images";
import { useColors } from "@/utils/theme";
import StoreForm, { StoreFormValues } from "@/components/form/StoreForm";

export default function StoreScreen() {
  const c = useColors();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const editing = id != null;
  const [store, setStore] = useState<Store | undefined>();
  const [loading, setLoading] = useState(editing);

  useEffect(() => {
    if (!editing) return;
    getStore(Number(id))
      .then(setStore)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id, editing]);

  async function onSubmit(v: StoreFormValues) {
    let imageUri = v.imageUri;
    if (imageUri && imageUri !== store?.imageUri)
      imageUri = persistImage(imageUri);
    if (store?.imageUri && store.imageUri !== imageUri)
      deleteImageFile(store.imageUri);

    if (editing && store) await updateStore(store.id, { ...v, imageUri });
    else await createStore({ ...v, imageUri });
    router.back();
  }

  function confirmDelete() {
    if (!store) return;
    Alert.alert("Delete store?", `“${store.name}” will be removed.`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await deleteStore(store.id);
          deleteImageFile(store.imageUri);
          router.back();
        },
      },
    ]);
  }

  if (loading) return <ActivityIndicator style={{ flex: 1 }} />;
  if (editing && !store)
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text style={{ color: c.text }}>Store not found</Text>
      </View>
    );

  return (
    <>
      <Stack.Screen
        options={{
          title: editing ? "Edit store" : "New store",
          headerRight: editing
            ? () => (
                <Pressable onPress={confirmDelete} hitSlop={10}>
                  <Ionicons name="trash-outline" size={22} color={c.danger} />
                </Pressable>
              )
            : undefined,
        }}
      />
      <StoreForm
        initial={store}
        submitLabel={editing ? "Save changes" : "Add store"}
        onSubmit={onSubmit}
      />
    </>
  );
}
