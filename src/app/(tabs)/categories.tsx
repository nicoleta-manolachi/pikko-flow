import CategoryFormModal from "@/components/form/CategoryFormModal";
import EmptyState from "@/components/layouts/EmptyState";
import { useCategories, useItems } from "@/db/hooks";
import { createCategory, deleteCategory, updateCategory } from "@/db/queries";
import type { Category } from "@/db/schema";
import { categoryIcon } from "@/utils/categoryIcons";
import { useColors } from "@/utils/theme";
import { Ionicons } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import {
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

export default function Categories() {
  const c = useColors();
  const categories = useCategories();
  const { items } = useItems();

  const [addOpen, setAddOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);

  const accentColor = c.pumpkin;
  const accentTint = c.offwhite;

  const itemCount = useMemo(() => {
    const counts = new Map<number, number>();
    for (const it of items) {
      if (it.categoryId != null)
        counts.set(it.categoryId, (counts.get(it.categoryId) ?? 0) + 1);
    }
    return counts;
  }, [items]);

  const guard = (fn: () => Promise<unknown>) =>
    fn().catch(() => Alert.alert("Something went wrong", "Please try again."));

  function confirmDelete(cat: Category) {
    const count = itemCount.get(cat.id) ?? 0;
    Alert.alert(
      "Delete category?",
      count > 0
        ? `“${cat.name}” will be removed. ${count} item${count > 1 ? "s" : ""} will become uncategorized.`
        : `“${cat.name}” will be removed.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => guard(() => deleteCategory(cat.id)),
        },
      ],
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={categories}
        keyExtractor={(cat) => String(cat.id)}
        contentContainerStyle={{ padding: 12, gap: 10, flexGrow: 1 }}
        renderItem={({ item: cat }) => {
          const icon = cat.icon ?? categoryIcon(cat.name);
          const count = itemCount.get(cat.id) ?? 0;
          return (
            <View
              style={[
                s.row,
                { backgroundColor: c.card, borderColor: c.border },
              ]}
            >
              <View style={[s.icon]}>
                <Ionicons name={icon as any} size={24} color={accentColor} />
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={{ color: c.text, fontSize: 16, fontWeight: "600" }}
                >
                  {cat.name}
                </Text>
                <Text style={{ color: c.sub, fontSize: 13 }}>
                  {count} item{count === 1 ? "" : "s"}
                </Text>
              </View>
              <Pressable
                onPress={() => setEditing(cat)}
                hitSlop={8}
                accessibilityLabel={`Edit ${cat.name}`}
              >
                <Ionicons name="create-outline" size={20} color={c.sub} />
              </Pressable>
              <Pressable
                onPress={() => confirmDelete(cat)}
                hitSlop={8}
                accessibilityLabel={`Delete ${cat.name}`}
              >
                <Ionicons name="trash-outline" size={20} color={c.danger} />
              </Pressable>
            </View>
          );
        }}
        ListEmptyComponent={
          <EmptyState
            icon="grid-outline"
            title="No categories yet"
            subtitle="Add categories like Dairy or Snacks to organize your pantry."
            actionLabel="Add your first category"
            accentColor={accentColor}
            accentTint={accentTint}
            onAction={() => setAddOpen(true)}
          />
        }
      />

      <Pressable
        onPress={() => setAddOpen(true)}
        style={[s.fab, { backgroundColor: accentColor }]}
        accessibilityLabel="Add category"
      >
        <Ionicons name="add" size={30} color="#fff" />
      </Pressable>

      <CategoryFormModal
        visible={addOpen}
        onClose={() => setAddOpen(false)}
        onSubmit={(v) => createCategory(v)}
        title="New category"
        submitLabel="Add category"
        accentColor={accentColor}
        accentTint={accentTint}
      />

      <CategoryFormModal
        visible={editing !== null}
        onClose={() => setEditing(null)}
        onSubmit={(v) => editing && updateCategory(editing.id, v)}
        initialName={editing?.name}
        initialIcon={
          editing?.icon ?? (editing ? categoryIcon(editing.name) : null)
        }
        title="Edit category"
        submitLabel="Save changes"
        accentColor={accentColor}
        accentTint={accentTint}
      />
    </View>
  );
}

const s = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
  },
  icon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  fab: {
    position: "absolute",
    right: 20,
    bottom: 24,
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: "center",
    justifyContent: "center",
    elevation: 6,
  },
});
