import CategoryCard from "@/components/cards/CategoryCard";
import CategoryDetailsSheet from "@/components/detail/CategoryDetailsSheet";
import Fab from "@/components/Fab";
import CategoryFormModal from "@/components/form/CategoryFormModal";
import BottomFadeOverlay from "@/components/layouts/BottomFadeOverlay";
import EmptyState from "@/components/layouts/EmptyState";
import { useCategories, useItems } from "@/db/hooks";
import { createCategory, deleteCategory, updateCategory } from "@/db/queries";
import type { Category } from "@/db/schema";
import { LIST_BOTTOM_PADDING, useColors } from "@/utils/theme";
import { useMemo, useState } from "react";
import { Alert, FlatList, View } from "react-native";

export default function Categories() {
  const c = useColors();
  const categories = useCategories();
  const { items } = useItems();

  const [addOpen, setAddOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [detailsCategory, setDetailsCategory] = useState<Category | null>(null);

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

  const detailsItems = useMemo(
    () =>
      detailsCategory
        ? items.filter((it) => it.categoryId === detailsCategory.id)
        : [],
    [items, detailsCategory],
  );

  const guard = (fn: () => Promise<unknown>) =>
    fn().catch(() => Alert.alert("Something went wrong", "Please try again."));

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={categories}
        keyExtractor={(cat) => String(cat.id)}
        contentContainerStyle={{
          padding: 12,
          paddingBottom: LIST_BOTTOM_PADDING,
          gap: 10,
          flexGrow: 1,
        }}
        renderItem={({ item: cat }) => (
          <CategoryCard
            category={cat}
            count={itemCount.get(cat.id) ?? 0}
            accentColor={accentColor}
            onPress={() => setDetailsCategory(cat)}
            onEdit={() => setEditing(cat)}
            onDelete={() => guard(() => deleteCategory(cat.id))}
          />
        )}
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
      <Fab
        onPress={() => setAddOpen(true)}
        backgroundColor={accentColor}
        accessibilityLabel="Add category"
      />

      <CategoryFormModal
        visible={addOpen}
        onClose={() => setAddOpen(false)}
        onSubmit={async (v) => {
          await createCategory(v);
        }}
        title="New category"
        submitLabel="Add category"
        accentColor={accentColor}
        accentTint={accentTint}
      />

      <CategoryFormModal
        visible={editing !== null}
        onClose={() => setEditing(null)}
        onSubmit={async (v) => {
          if (!editing) return;
          await updateCategory(editing.id, v);
        }}
        initialName={editing?.name}
        initialIcon={editing?.icon ?? null}
        title="Edit category"
        submitLabel="Save changes"
        accentColor={accentColor}
        accentTint={accentTint}
      />

      <CategoryDetailsSheet
        visible={detailsCategory !== null}
        category={detailsCategory}
        itemsCount={detailsItems.length}
        categoryItems={detailsItems}
        accentColor={accentColor}
        onClose={() => setDetailsCategory(null)}
        onEdit={() => {
          if (!detailsCategory) return;
          const cat = detailsCategory;
          setDetailsCategory(null);
          setEditing(cat);
        }}
      />

      <BottomFadeOverlay />
    </View>
  );
}
