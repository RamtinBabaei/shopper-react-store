import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import type { Order } from "../shared";
import { api } from "../api";
import { useStore } from "../store";
import { PageHeading, Loading, ErrorState, EmptyState } from "../components/UI";
import OrderCard from "../components/OrderCard";
import { ArrowLeft, ArrowRight } from "lucide-react";
export default function Orders() {
  const { user } = useStore();
  const [params, setParams] = useSearchParams();
  const page = Math.max(1, Number(params.get("page") || 1));
  const returned = params.get("payment") === "returned";
  const result = useQuery({
    queryKey: ["orders", user?._id, page],
    queryFn: () => api<{ orders: Order[]; pages: number }>(`/orders?page=${page}`),
    refetchInterval: (query) =>
      returned &&
      query.state.data?.orders.some(
        (o) =>
          o.paymentMethod === "stripe" &&
          o.paymentStatus === "unpaid" &&
          o.status === "placed",
      )
        ? 5000
        : false,
  });
  return (
    <div className="container orders-page">
      <PageHeading
        eyebrow="YOUR SHOPPER STORY"
        title="Your orders."
        description="From that first click to your next favorite outfit."
      />
      {params.has("new") && (
        <p className="success-banner" role="status">
          Your order is in. You can follow its progress here.
        </p>
      )}
      {result.data && result.data.pages > 1 && (
        <nav className="pagination" aria-label="Order pages">
          <button
            aria-label="Previous page"
            disabled={page <= 1}
            onClick={() => {
              const p = new URLSearchParams(params);
              p.set("page", String(page - 1));
              setParams(p);
            }}
          >
            <ArrowLeft size={16} />
          </button>
          <span>
            Page {page} of {result.data.pages}
          </span>
          <button
            aria-label="Next page"
            disabled={page >= result.data.pages}
            onClick={() => {
              const p = new URLSearchParams(params);
              p.set("page", String(page + 1));
              setParams(p);
            }}
          >
            <ArrowRight size={16} />
          </button>
        </nav>
      )}
      {returned && (
        <p className="demo-note">
          Payment is confirmed after the secure payment notification arrives. This page
          updates automatically.
        </p>
      )}
      {params.get("payment") === "cancelled" && (
        <p className="demo-note">
          Your reservation is saved. Complete payment or cancel the order below.
        </p>
      )}
      {result.isPending ? (
        <Loading />
      ) : result.error ? (
        <ErrorState error={result.error} retry={() => result.refetch()} />
      ) : result.data.orders.length ? (
        <div className="orders-list">
          {result.data.orders.map((o) => (
            <OrderCard order={o} key={o._id} />
          ))}
        </div>
      ) : (
        <EmptyState
          title="Every story starts somewhere."
          description="Your orders will appear here after your first checkout."
        />
      )}
    </div>
  );
}
