import { Link } from "react-router-dom";
import { Minus, Plus, X, ArrowRight, ArrowLeft, Truck } from "lucide-react";
import { calculateTotals, money, FREE_SHIPPING } from "../shared";
import { useStore } from "../store";
import { EmptyState, PageHeading, Loading, ErrorState } from "../components/UI";
export default function Cart() {
  const { items, quantity, cartBusy, cartLoading, cartError, notice, refreshCart } =
    useStore();
  const totals = calculateTotals(
    items
      .filter((i) => i.product)
      .map((i) => ({ quantity: i.quantity, price: i.product.price })),
  );
  const update = async (
    id: string,
    size: (typeof items)[number]["size"],
    amount: number,
  ) => {
    try {
      await quantity(id, size, amount);
    } catch (e) {
      notice((e as Error).message);
    }
  };
  if (cartLoading) return <Loading />;
  if (cartError) return <ErrorState error={cartError} retry={refreshCart} />;
  return (
    <div className="container cart-page">
      <PageHeading
        eyebrow="ALMOST YOURS"
        title="Your bag."
        description={`${items.reduce((s, i) => s + i.quantity, 0)} pieces of your next everyday.`}
      />
      {!items.length ? (
        <EmptyState
          title="Room for a new favorite."
          description="Your bag is empty. Let's find something that feels like you."
        />
      ) : (
        <div className="cart-layout">
          <section>
            <div className="bag-table-heading">
              <span>YOUR PIECES</span>
              <span>QUANTITY / TOTAL</span>
            </div>
            {items.map((item) => (
              <article className="bag-line" key={`${item.productId}-${item.size}`}>
                {item.product ? (
                  <Link to={`/product/${item.product.slug}`}>
                    <img
                      src={item.product.images[0]}
                      alt={item.product.name}
                      width="96"
                      height="120"
                    />
                  </Link>
                ) : (
                  <div className="unavailable-image" />
                )}
                <div className="bag-line-details">
                  <p className="eyebrow">{item.product?.category || "UNAVAILABLE"}</p>
                  <Link to={item.product ? `/product/${item.product.slug}` : "/shop"}>
                    {item.product?.name || "This piece is no longer available"}
                  </Link>
                  <p>
                    {item.product?.color} / Size {item.size}
                  </p>
                  {item.product && <strong>{money(item.product.price)}</strong>}
                  {(!item.product?.active ||
                    item.quantity > (item.product?.stock[item.size] || 0)) && (
                    <p className="form-error">
                      Please update or remove this unavailable quantity.
                    </p>
                  )}
                </div>
                <div className="bag-line-actions">
                  <button
                    className="icon-button remove-piece"
                    aria-label={`Remove ${item.product?.name || "item"}`}
                    disabled={cartBusy}
                    onClick={() => update(item.productId, item.size, 0)}
                  >
                    <X size={16} />
                  </button>
                  <div className="quantity-control">
                    <button
                      aria-label={`Decrease ${item.product?.name} quantity`}
                      disabled={cartBusy || item.quantity <= 1}
                      onClick={() => update(item.productId, item.size, item.quantity - 1)}
                    >
                      <Minus size={13} />
                    </button>
                    <span>{item.quantity}</span>
                    <button
                      aria-label={`Increase ${item.product?.name} quantity`}
                      disabled={
                        cartBusy ||
                        item.quantity >= Math.min(10, item.product?.stock[item.size] || 0)
                      }
                      onClick={() => update(item.productId, item.size, item.quantity + 1)}
                    >
                      <Plus size={13} />
                    </button>
                  </div>
                  <strong>{money((item.product?.price || 0) * item.quantity)}</strong>
                </div>
              </article>
            ))}
            <Link className="text-link continue-shopping" to="/shop">
              <ArrowLeft size={16} /> Keep exploring
            </Link>
          </section>
          <aside className="order-summary">
            <p className="eyebrow">THE GOOD PART</p>
            <h2>A little bag of possibilities.</h2>
            <div className="summary-row">
              <span>Subtotal</span>
              <span>{money(totals.subtotal)}</span>
            </div>
            <div className="summary-row">
              <span>Shipping</span>
              <span>{totals.shipping ? money(totals.shipping) : "On us"}</span>
            </div>
            <div className="summary-row total">
              <strong>Total</strong>
              <strong>{money(totals.total)}</strong>
            </div>
            <p className="small muted">
              Final prices and availability are confirmed at checkout.
            </p>
            <Link className="button dark full" to="/checkout">
              Continue to checkout <ArrowRight size={17} />
            </Link>
            <div className="shipping-progress">
              <Truck size={17} />
              <p>
                {totals.subtotal >= FREE_SHIPPING
                  ? "Your order ships free. Nice."
                  : `You're ${money(FREE_SHIPPING - totals.subtotal)} away from free shipping.`}
              </p>
              <progress
                value={Math.min(FREE_SHIPPING, totals.subtotal)}
                max={FREE_SHIPPING}
              />
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
