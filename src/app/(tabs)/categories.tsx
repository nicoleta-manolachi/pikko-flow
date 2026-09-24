import EmptyState from "@/components/EmptyState";
import { useItems } from "@/db/hooks";
import { useColors } from "@/utils/theme";

export default function Categories() {
  const c = useColors();
  const { items } = useItems();

  return (
    <EmptyState
      icon="cart-outline"
      title="Nothing to buy"
      subtitle="Tap the cart icon on a pantry item to add it here."
    />
  );
}
