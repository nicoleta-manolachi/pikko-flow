import Chip from "@/components/Chip";
import type { Category, Priority, Store } from "@/db/schema";
import { PRIORITIES } from "@/db/schema";
import type { SortKey } from "@/store/uiStore";
import { SORT_LABELS } from "@/components/SortMenu";
import { useColors } from "@/utils/theme";
import { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import BottomSheet from "@/components/BottomSheet";

export type FilterDraft = {
  sort?: SortKey;
  categoryId: number | null;
  storeId: number | null;
  priority: Priority | null;
};

type Props = {
  visible: boolean;
  onClose: () => void;
  value: FilterDraft;
  onApply: (v: FilterDraft) => void;
  categories?: Category[];
  stores: Store[];
  accentColor: string;
  accentTint: string;
  showSort?: boolean; // default true
};

export default function FilterModal({
  visible,
  onClose,
  value,
  onApply,
  categories = [],
  stores,
  accentColor,
  accentTint,
  showSort = true,
}: Props) {
  const c = useColors();
  const [draft, setDraft] = useState<FilterDraft>(value);

  useEffect(() => {
    if (visible) setDraft(value);
  }, [visible, value]);

  const chipProps = {
    activeBg: accentColor,
    activeText: "#fff",
    inactiveBg: accentTint,
  };

  function clearAll() {
    setDraft((d) => ({
      sort: d.sort,
      categoryId: null,
      storeId: null,
      priority: null,
    }));
  }

  function apply() {
    onApply(draft);
    onClose();
  }

  const activeCount =
    (draft.categoryId != null ? 1 : 0) +
    (draft.storeId != null ? 1 : 0) +
    (draft.priority != null ? 1 : 0);

  return (
    <BottomSheet visible={visible} onClose={onClose}>
      <View style={s.headerRow}>
        <Text style={[s.title, { color: c.text }]}>Filters</Text>
        <Pressable onPress={clearAll} hitSlop={8}>
          <Text style={{ color: accentColor, fontWeight: "600" }}>
            Clear all
          </Text>
        </Pressable>
      </View>

      <ScrollView
        style={{ maxHeight: 420 }}
        showsVerticalScrollIndicator={false}
      >
        {showSort && draft.sort && (
          <>
            <Text style={[s.sectionLabel, { color: c.sub }]}>Sort by</Text>
            <View style={s.wrapRow}>
              {(Object.keys(SORT_LABELS) as SortKey[]).map((k) => (
                <Chip
                  key={k}
                  label={SORT_LABELS[k]}
                  selected={draft.sort === k}
                  onPress={() => setDraft((d) => ({ ...d, sort: k }))}
                  {...chipProps}
                />
              ))}
            </View>
          </>
        )}

        <Text style={[s.sectionLabel, { color: c.sub }]}>Priority</Text>
        <View style={s.wrapRow}>
          {PRIORITIES.map((p) => (
            <Chip
              key={p}
              label={p}
              selected={draft.priority === p}
              onPress={() =>
                setDraft((d) => ({
                  ...d,
                  priority: d.priority === p ? null : p,
                }))
              }
              {...chipProps}
            />
          ))}
        </View>

        {categories.length > 0 && (
          <>
            <Text style={[s.sectionLabel, { color: c.sub }]}>Category</Text>
            <View style={s.wrapRow}>
              {categories.map((cat) => (
                <Chip
                  key={cat.id}
                  label={cat.name}
                  selected={draft.categoryId === cat.id}
                  onPress={() =>
                    setDraft((d) => ({
                      ...d,
                      categoryId: d.categoryId === cat.id ? null : cat.id,
                    }))
                  }
                  {...chipProps}
                />
              ))}
            </View>
          </>
        )}

        {stores.length > 0 && (
          <>
            <Text style={[s.sectionLabel, { color: c.sub }]}>Store</Text>
            <View style={s.wrapRow}>
              {stores.map((st) => (
                <Chip
                  key={st.id}
                  label={st.name}
                  selected={draft.storeId === st.id}
                  onPress={() =>
                    setDraft((d) => ({
                      ...d,
                      storeId: d.storeId === st.id ? null : st.id,
                    }))
                  }
                  {...chipProps}
                />
              ))}
            </View>
          </>
        )}
      </ScrollView>

      <Pressable
        onPress={apply}
        style={[s.applyBtn, { backgroundColor: accentColor }]}
      >
        <Text style={{ color: "#fff", fontWeight: "700", fontSize: 16 }}>
          Show results{activeCount > 0 ? ` (${activeCount})` : ""}
        </Text>
      </Pressable>
    </BottomSheet>
  );
}

const s = StyleSheet.create({
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  title: { fontSize: 20, fontWeight: "800" },
  sectionLabel: {
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    marginTop: 18,
    marginBottom: 8,
  },
  wrapRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  applyBtn: {
    marginTop: 20,
    paddingVertical: 14,
    borderRadius: 28,
    alignItems: "center",
  },
});
