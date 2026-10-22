import { useRef, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  ArrowLeft,
  LockKeyhole,
  CreditCard,
  Banknote,
  Check,
} from "lucide-react";
import {
  calculateTotals,
  money,
  checkoutSchema,
  type Order,
  type Address,
} from "../shared";
import { api, json } from "../api";
import { useStore } from "../store";
import {
  PageHeading,
  FormError,
  Loading,
  ErrorState,
  EmptyState,
} from "../components/UI";
export default function Checkout() {
  const { items, user, cartLoading, cartError, refreshCart, notice } = useStore();
  const navigate = useNavigate();
  const [method, setMethod] = useState<"cod" | "stripe">("cod");
  const [coupon, setCoupon] = useState("");
  const [draftCoupon, setDraftCoupon] = useState("");
  const [error, setError] = useState("");
  const [couponError, setCouponError] = useState("");
  const [busy, setBusy] = useState(false);
  const request = useRef<{ hash: string; key: string } | null>(null);
  const config = useQuery({
    queryKey: ["config"],
    queryFn: () => api<{ cardPayments: boolean; currency: string }>("/config"),
  });
  const totals = calculateTotals(
    items
      .filter((i) => i.product)
      .map((i) => ({ price: i.product.price, quantity: i.quantity })),
    coupon,
  );
  function applyCoupon() {
    if (draftCoupon.trim().toUpperCase() === "WELCOME10") {
      setCoupon("WELCOME10");
      setCouponError("");
    } else {
      setCoupon("");
      setCouponError("That code is not valid. Try WELCOME10.");
    }
  }
  async function placeOrder(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (busy) return;
    setError("");
    const form = new FormData(e.currentTarget);
    const address = Object.fromEntries(
      ["name", "email", "phone", "street", "city", "postalCode", "country"].map((k) => [
        k,
        String(form.get(k) || ""),
      ]),
    ) as Address;
    const validated = checkoutSchema.safeParse({
      address,
      paymentMethod: method,
      coupon,
    });
    if (!validated.success) {
      setError(validated.error.issues[0].message);
      return;
    }
    const hash = json(validated.data);
    if (request.current?.hash !== hash)
      request.current = { hash, key: crypto.randomUUID() };
    setBusy(true);
    try {
      const { order } = await api<{ order: Order }>("/orders", {
        method: "POST",
        headers: { "Idempotency-Key": request.current.key },
        body: hash,
      });
      await refreshCart();
      if (method === "stripe") {
        try {
          const { url } = await api<{ url: string }>(`/orders/${order._id}/pay`, {
            method: "POST",
          });
          window.location.assign(url);
          return;
        } catch (e) {
          notice(
            `Your order is saved. ${(e as Error).message} You can retry payment from your orders.`,
          );
          navigate("/orders");
          return;
        }
      }
      notice(`Order ${order.number} is confirmed`);
      navigate("/orders?new=1");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  if (cartLoading || config.isPending) return <Loading />;
  if (cartError || config.error)
    return (
      <ErrorState
        error={cartError || config.error!}
        retry={() => {
          refreshCart();
          config.refetch();
        }}
      />
    );
  if (!items.length)
    return (
      <EmptyState
        title="Your bag is waiting."
        description="Add your favorite pieces before checking out."
      />
    );
  return (
    <div className="container checkout-page">
      <Link className="text-link" to="/cart">
        <ArrowLeft size={16} /> Back to your bag
      </Link>
      <PageHeading eyebrow="A FEW DETAILS, THEN IT'S YOURS" title="The final touch." />
      <p className="demo-note">
        This is a portfolio store. Orders demonstrate the shopping experience; no physical
        goods are shipped. Use fictional details. Data stays in this browser; no payment is taken.
      </p>
      <form className="checkout-layout" onSubmit={placeOrder}>
        <div>
          <section className="checkout-section">
            <div className="checkout-title">
              <span>01</span>
              <h2>Where should it go?</h2>
            </div>
            <div className="form-grid">
              <label>
                Full name
                <input
                  name="name"
                  autoComplete="name"
                  defaultValue={user?.name}
                  required
                  minLength={2}
                  maxLength={80}
                />
              </label>
              <label>
                Email address
                <input
                  name="email"
                  type="email"
                  autoComplete="email"
                  defaultValue={user?.email}
                  required
                  maxLength={254}
                />
              </label>
              <label className="span-2">
                Street address
                <input
                  name="street"
                  autoComplete="street-address"
                  required
                  minLength={4}
                  maxLength={160}
                />
              </label>
              <label>
                City
                <input
                  name="city"
                  autoComplete="address-level2"
                  required
                  minLength={2}
                  maxLength={80}
                />
              </label>
              <label>
                Postal code
                <input
                  name="postalCode"
                  autoComplete="postal-code"
                  required
                  minLength={2}
                  maxLength={20}
                />
              </label>
              <label>
                Country
                <input
                  name="country"
                  autoComplete="country-name"
                  defaultValue="United States"
                  required
                  minLength={2}
                  maxLength={80}
                />
              </label>
              <label>
                Phone number
                <input
                  name="phone"
                  type="tel"
                  autoComplete="tel"
                  required
                  minLength={7}
                  maxLength={30}
                />
              </label>
            </div>
          </section>
          <section className="checkout-section">
            <div className="checkout-title">
              <span>02</span>
              <h2>How would you like to pay?</h2>
            </div>
            <label className={`payment-choice ${method === "cod" ? "chosen" : ""}`}>
              <input
                type="radio"
                name="payment"
                value="cod"
                checked={method === "cod"}
                onChange={() => setMethod("cod")}
              />
              <Banknote />
              <span>
                <strong>Demo order</strong>
                <small>Simulate checkout. Nothing is purchased or shipped.</small>
              </span>
              {method === "cod" && <Check size={17} />}
            </label>
            <label
              className={`payment-choice ${method === "stripe" ? "chosen" : ""} ${!config.data?.cardPayments ? "disabled" : ""}`}
            >
              <input
                type="radio"
                name="payment"
                value="stripe"
                checked={method === "stripe"}
                disabled={!config.data?.cardPayments}
                onChange={() => setMethod("stripe")}
              />
              <CreditCard />
              <span>
                <strong>Pay by card</strong>
                <small>
                  {config.data?.cardPayments
                    ? "Continue to secure Stripe Checkout."
                    : "Card payments are not enabled for this store."}
                </small>
              </span>
            </label>
          </section>
        </div>
        <aside className="order-summary checkout-summary">
          <p className="eyebrow">YOUR NEXT FAVORITES</p>
          <h2>Order summary.</h2>
          <div className="checkout-items">
            {items.map((i) => (
              <div className="checkout-item" key={`${i.productId}-${i.size}`}>
                <img
                  src={i.product?.images[0]}
                  alt={i.product?.name || "Unavailable piece"}
                  width="56"
                  height="68"
                />
                <div>
                  <strong>{i.product?.name || "Unavailable piece"}</strong>
                  <p>
                    Size {i.size} / Qty {i.quantity}
                  </p>
                </div>
                <span>{money((i.product?.price || 0) * i.quantity)}</span>
              </div>
            ))}
          </div>
          <label htmlFor="promo-code" className="small">
            A little something extra?
          </label>
          <div className="coupon-field">
            <input
              id="promo-code"
              value={draftCoupon}
              onChange={(e) => setDraftCoupon(e.target.value)}
              placeholder="Promotion code"
              maxLength={30}
            />
            <button type="button" onClick={applyCoupon}>
              Apply
            </button>
          </div>
          <FormError message={couponError} />
          {coupon && (
            <p className="success-text">WELCOME10 applied. 10% off your pieces.</p>
          )}
          <div className="summary-row">
            <span>Subtotal</span>
            <span>{money(totals.subtotal)}</span>
          </div>
          {totals.discount > 0 && (
            <div className="summary-row success-text">
              <span>Your discount</span>
              <span>−{money(totals.discount)}</span>
            </div>
          )}
          <div className="summary-row">
            <span>Shipping</span>
            <span>{totals.shipping ? money(totals.shipping) : "On us"}</span>
          </div>
          <div className="summary-row total">
            <strong>Total</strong>
            <strong>{money(totals.total)}</strong>
          </div>
          <label className="check-label">
            <input type="checkbox" required /> I agree to the{" "}
            <Link to="/info/terms">terms</Link> and understand this is a demonstration.
          </label>
          <FormError message={error} />
          <button className="button dark full" type="submit" disabled={busy}>
            {busy
              ? "Confirming your order…"
              : method === "stripe"
                ? "Continue to secure payment"
                : "Save demo order"}
            <ArrowRight size={17} />
          </button>
          <p className="secure-note">
            <LockKeyhole size={14} /> Demo order saved only in this browser.
          </p>
        </aside>
      </form>
    </div>
  );
}
