import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Package, ArrowRight, Check, Truck, X } from "lucide-react";
import { money, type Order, type OrderState } from "../shared";
import { api, json } from "../api";
import { useStore } from "../store";
export default function OrderCard({
  order: o,
  admin = false,
}: {
  order: Order;
  admin?: boolean;
}) {
  const query = useQueryClient();
  const { notice } = useStore();
  const [confirm, setConfirm] = useState(false);
  const [paying, setPaying] = useState(false);
  const mutation = useMutation({
    mutationFn: (status: OrderState) =>
      api(admin ? `/admin/orders/${o._id}` : `/orders/${o._id}/cancel`, {
        method: admin ? "PATCH" : "POST",
        ...(admin ? { body: json({ status }) } : {}),
      }),
    onSuccess: () => {
      query.invalidateQueries({ queryKey: ["orders"] });
      query.invalidateQueries({ queryKey: ["admin"] });
      query.invalidateQueries({ queryKey: ["products"] });
      notice("Order updated");
      setConfirm(false);
    },
    onError: (e) => notice(e.message),
  });
  const next: Partial<Record<OrderState, OrderState>> = {
    placed: "packing",
    packing: "shipped",
    shipped: "delivered",
  };
  async function pay() {
    setPaying(true);
    try {
      const { url } = await api<{ url: string }>(`/orders/${o._id}/pay`, {
        method: "POST",
      });
      window.location.assign(url);
    } catch (e) {
      notice((e as Error).message);
      setPaying(false);
    }
  }
  return (
    <article className="order-card">
      <div className="order-card-top">
        <div>
          <p className="eyebrow">{o.number}</p>
          <p className="small muted">
            {new Date(o.createdAt).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
          </p>
        </div>
        <span className={`status-pill ${o.status}`}>
          {o.status === "delivered" ? (
            <Check size={12} />
          ) : o.status === "shipped" ? (
            <Truck size={12} />
          ) : (
            <Package size={12} />
          )}{" "}
          {o.status}
        </span>
        <strong>{money(o.totals.total, o.currency)}</strong>
      </div>
      <div className="order-card-items">
        {o.items.map((i) => (
          <div key={`${i.productId}-${i.size}`}>
            <img src={i.image} alt={i.name} width="60" height="72" loading="lazy" />
            <p>
              <strong>{i.name}</strong>
              <span>
                Size {i.size} / Qty {i.quantity}
              </span>
            </p>
            <span>{money(i.price * i.quantity, o.currency)}</span>
          </div>
        ))}
      </div>
      <div className="order-card-footer">
        <p>
          <strong>
            {o.paymentMethod === "cod" ? "Cash on delivery" : "Card payment"}
          </strong>
          <span>
            {o.paymentStatus === "review"
              ? "Payment needs support review"
              : o.paymentStatus === "paid"
                ? "Payment received"
                : o.paymentStatus === "expired"
                  ? "Payment reservation expired"
                  : "Awaiting payment"}
          </span>
        </p>
        <p>
          <strong>Deliver to {o.address.name}</strong>
          <span>
            {o.address.street}, {o.address.city}, {o.address.postalCode},{" "}
            {o.address.country}
          </span>
        </p>
        {admin && (
          <p>
            <strong>Contact</strong>
            <span>
              {o.address.email} / {o.address.phone}
            </span>
          </p>
        )}
      </div>
      <div className="order-actions">
        {!admin &&
          o.paymentMethod === "stripe" &&
          o.paymentStatus === "unpaid" &&
          o.status === "placed" && (
            <button className="button dark small-button" disabled={paying} onClick={pay}>
              {paying ? "Connecting…" : "Complete payment"}
              <ArrowRight size={14} />
            </button>
          )}
        {admin && next[o.status] && (
          <button
            className="button dark small-button"
            disabled={mutation.isPending}
            onClick={() => mutation.mutate(next[o.status]!)}
          >
            Mark as {next[o.status]}
            <ArrowRight size={14} />
          </button>
        )}
        {(o.status === "placed" || (admin && o.status === "packing")) &&
          o.paymentStatus === "unpaid" &&
          (confirm ? (
            <>
              <span>Cancel this order and release its stock?</span>
              <button
                className="danger-link"
                disabled={mutation.isPending}
                onClick={() => mutation.mutate("cancelled")}
              >
                Yes, cancel order
              </button>
              <button className="muted-link" onClick={() => setConfirm(false)}>
                Keep order
              </button>
            </>
          ) : (
            <button className="muted-link" onClick={() => setConfirm(true)}>
              <X size={14} /> Cancel order
            </button>
          ))}
      </div>
    </article>
  );
}
