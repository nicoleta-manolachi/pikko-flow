import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, Text, View } from 'react-native';
import ItemForm, { type ItemFormValues } from '@/components/ItemForm';
import { createItem, deleteItem, getItem, updateItem } from '@/db/queries';
import type { Item } from '@/db/schema';
import { deleteImageFile, persistImage } from '@/utils/images';
import { useColors } from '@/utils/theme';

export default function ItemScreen() {
  const c = useColors();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const editing = id != null;
  const [item, setItem] = useState<Item | undefined>();
  const [loading, setLoading] = useState(editing);

  useEffect(() => {
    if (!editing) return;
    getItem(Number(id)).then(setItem).catch(() => {}).finally(() => setLoading(false));
  }, [id, editing]);

  async function onSubmit(v: ItemFormValues) {
    // Persist a newly picked image; remove the replaced one.
    let imageUri = v.imageUri;
    if (imageUri && imageUri !== item?.imageUri) imageUri = persistImage(imageUri);
    if (item?.imageUri && item.imageUri !== imageUri) deleteImageFile(item.imageUri);

    if (editing && item) await updateItem(item.id, { ...v, imageUri });
    else await createItem({ ...v, imageUri });
    router.back();
  }

  function confirmDelete() {
    if (!item) return;
    Alert.alert('Delete item?', `“${item.name}” will be removed.`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => { await deleteItem(item.id); deleteImageFile(item.imageUri); router.back(); } },
    ]);
  }

  if (loading) return <ActivityIndicator style={{ flex: 1 }} />;
  if (editing && !item) return <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><Text style={{ color: c.text }}>Item not found</Text></View>;

  return (
    <>
      <Stack.Screen
        options={{
          title: editing ? 'Edit item' : 'New item',
          headerRight: editing ? () => <Pressable onPress={confirmDelete} hitSlop={10}><Ionicons name="trash-outline" size={22} color={c.danger} /></Pressable> : undefined,
        }}
      />
      <ItemForm initial={item} submitLabel={editing ? 'Save changes' : 'Add item'} onSubmit={onSubmit} />
    </>
  );
}
