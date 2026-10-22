import { useQuery } from "@tanstack/react-query";
import { Heart } from "lucide-react";
import type { Product } from "../shared";
import { api } from "../api";
import { useStore } from "../store";
import {
  PageHeading,
  Loading,
  ErrorState,
  EmptyState,
  ProductGrid,
} from "../components/UI";
export default function Wishlist() {
  const { user } = useStore();
  const result = useQuery({
    queryKey: ["wishlist", user?._id],
    queryFn: () => api<{ products: Product[] }>("/wishlist"),
  });
  return (
    <div className="container wishlist-page">
      <PageHeading
        eyebrow="KEEP THE GOOD ONES CLOSE"
        title="Your saved pieces."
        description="A little collection of things that feel like you."
      />
      {result.isPending ? (
        <Loading />
      ) : result.error ? (
        <ErrorState error={result.error} retry={() => result.refetch()} />
      ) : result.data.products.length ? (
        <ProductGrid products={result.data.products} />
      ) : (
        <EmptyState
          title="A space for your favorites."
          description="Tap the heart on a piece you love. We'll keep it here for you."
          icon={<Heart size={36} />}
        />
      )}
    </div>
  );
}
