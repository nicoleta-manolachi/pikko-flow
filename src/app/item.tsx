import { Ionicons } from "@expo/vector-icons";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Pressable, Text, View } from "react-native";
import ItemForm, { type ItemFormValues } from "@/components/form/ItemForm";
import {
  createItem,
  deleteItem,
  getItem,
  getItemStoreIds,
  updateItem,
} from "@/db/queries";
import type { Item } from "@/db/schema";
import { deleteImageFile, persistImage } from "@/utils/images";
import { useColors } from "@/utils/theme";

export default function ItemScreen() {
  const c = useColors();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const editing = id != null;
  const [item, setItem] = useState<Item | undefined>();
  const [loading, setLoading] = useState(editing);

  const [storeIds, setStoreIds] = useState<number[]>([]);

  useEffect(() => {
    if (!editing) return;
    Promise.all([getItem(Number(id)), getItemStoreIds(Number(id))])
      .then(([it, sids]) => {
        setItem(it);
        setStoreIds(sids);
      })
      .finally(() => setLoading(false));
  }, [id, editing]);

  async function onSubmit(v: ItemFormValues) {
    try {
      let imageUri = v.imageUri;
      if (imageUri && imageUri !== item?.imageUri)
        imageUri = persistImage(imageUri);
      if (item?.imageUri && item.imageUri !== imageUri)
        deleteImageFile(item.imageUri);

      if (editing && item) await updateItem(item.id, { ...v, imageUri });
      else await createItem({ ...v, imageUri });
      router.back();
    } catch (err) {
      console.error("Save failed:", err); // add this
      throw err; // keep ItemForm's own catch/Alert behavior
    }
  }

  function confirmDelete() {
    if (!item) return;
    Alert.alert("Delete item?", `“${item.name}” will be removed.`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await deleteItem(item.id);
          deleteImageFile(item.imageUri);
          router.back();
        },
      },
    ]);
  }

  if (loading) return <ActivityIndicator style={{ flex: 1 }} />;
  if (editing && !item)
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text style={{ color: c.text }}>Item not found</Text>
      </View>
    );

  return (
    <>
      <Stack.Screen
        options={{
          title: editing ? "Edit item" : "New item",
          headerRight: editing
            ? () => (
                <Pressable onPress={confirmDelete} hitSlop={10}>
                  <Ionicons name="trash-outline" size={22} color={c.danger} />
                </Pressable>
              )
            : undefined,
        }}
      />
      <ItemForm
        initial={item}
        initialStoreIds={storeIds}
        submitLabel={editing ? "Save changes" : "Add item"}
        onSubmit={onSubmit}
      />
    </>
  );
}
