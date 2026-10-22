import { useRef, useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  ShoppingBag,
  Check,
  Minus,
  Plus,
  Ruler,
  Truck,
  X,
} from "lucide-react";
import { sizes, money, type Product as ProductType, type Size } from "../shared";
import { api } from "../api";
import { useStore } from "../store";
import {
  Loading,
  ErrorState,
  SectionTitle,
  ProductGrid,
  FormError,
} from "../components/UI";
export default function Product() {
  const { slug } = useParams();
  const [image, setImage] = useState(0);
  useEffect(() => {
    setImage(0);
    setSize(null);
    setAmount(1);
    setError("");
  }, [slug]);
  const [size, setSize] = useState<Size | null>(null);
  const [amount, setAmount] = useState(1);
  const [error, setError] = useState("");
  const dialog = useRef<HTMLDialogElement>(null);
  const { add, cartBusy } = useStore();
  const result = useQuery({
    queryKey: ["product", slug],
    queryFn: ({ signal }) =>
      api<{ product: ProductType }>(`/products/${slug}`, { signal }),
  });
  const related = useQuery({
    queryKey: ["products", "related", result.data?.product.category],
    queryFn: () =>
      api<{ products: ProductType[] }>(
        `/products?category=${result.data!.product.category}&limit=5`,
      ),
    enabled: Boolean(result.data),
  });
  if (result.isPending) return <Loading />;
  if (result.error)
    return (
      <div className="container">
        <ErrorState error={result.error} retry={() => result.refetch()} />
      </div>
    );
  const p = result.data.product;
  async function addItem() {
    if (!size) {
      setError("Choose your size to add this piece to your bag.");
      return;
    }
    setError("");
    try {
      await add(p, size, amount);
    } catch (e) {
      setError((e as Error).message);
    }
  }
  return (
    <div className="container product-page">
      <nav className="breadcrumbs" aria-label="Breadcrumb">
        <Link to="/shop">Collection</Link>
        <span>/</span>
        <Link to={`/shop/${p.category}`}>{p.category}</Link>
        <span>/</span>
        <span>{p.name}</span>
      </nav>
      <div className="product-layout">
        <div className="detail-image">
          <span className="detail-label">THE SHOPPER EDIT</span>
          <img
            src={p.images[image] || p.images[0]}
            alt={p.name}
            width="650"
            height="776"
            fetchPriority="high"
          />
          <span className="image-caption">A PIECE OF YOUR EVERYDAY.</span>
          {p.images.length > 1 && (
            <div className="gallery-thumbs">
              {p.images.map((src, i) => (
                <button
                  key={src}
                  aria-label={`View product image ${i + 1}`}
                  aria-pressed={image === i}
                  onClick={() => setImage(i)}
                >
                  <img src={src} alt="" width="50" height="60" />
                </button>
              ))}
            </div>
          )}
        </div>
        <section className="product-info">
          <p className="eyebrow">
            {p.category} COLLECTION / {p.color}
          </p>
          <h1>{p.name}</h1>
          <div className="detail-price">
            {money(p.price)} {p.compareAt > p.price && <del>{money(p.compareAt)}</del>}
            {p.compareAt > p.price && (
              <span>Save {Math.round((1 - p.price / p.compareAt) * 100)}%</span>
            )}
          </div>
          <p className="product-description">{p.description}</p>
          <div className="color-choice">
            <span>
              Color: <strong>{p.color}</strong>
            </span>
          </div>
          <div className="row-between size-heading">
            <span>Find your fit {size && <strong> / {size}</strong>}</span>
            <button className="muted-link" onClick={() => dialog.current?.showModal()}>
              <Ruler size={15} /> Size guide
            </button>
          </div>
          <div className="detail-sizes">
            {sizes.map((s) => (
              <button
                key={s}
                aria-pressed={s === size}
                disabled={p.stock[s] === 0}
                title={p.stock[s] === 0 ? "Out of stock" : `${p.stock[s]} available`}
                className={size === s ? "selected" : ""}
                onClick={() => {
                  setSize(s);
                  setAmount(1);
                  setError("");
                }}
              >
                {s}
              </button>
            ))}
          </div>
          <p className="stock-note">
            {size ? (
              <>
                <Check size={13} /> {p.stock[size]} available in {size}
              </>
            ) : (
              "Choose a size to see availability"
            )}
          </p>
          <div className="add-to-bag">
            <div className="quantity-control">
              <button
                aria-label="Decrease quantity"
                disabled={amount <= 1}
                onClick={() => setAmount(amount - 1)}
              >
                <Minus size={14} />
              </button>
              <span>{amount}</span>
              <button
                aria-label="Increase quantity"
                disabled={!size || amount >= Math.min(10, p.stock[size])}
                onClick={() => setAmount(amount + 1)}
              >
                <Plus size={14} />
              </button>
            </div>
            <button
              className="button dark"
              onClick={addItem}
              disabled={cartBusy || !sizes.some((s) => p.stock[s] > 0)}
            >
              <ShoppingBag size={18} />
              {cartBusy ? "Adding…" : "Add to bag"}
              <ArrowRight size={18} />
            </button>
          </div>
          <FormError message={error} />
          <div className="product-delivery">
            <Truck size={18} />
            <span>Free shipping over $100. 30-day returns.</span>
          </div>
          <details open>
            <summary>Details & care</summary>
            <p>{p.material} Follow the care label to keep your piece looking its best.</p>
          </details>
          <details>
            <summary>Delivery & returns</summary>
            <p>
              Standard shipping is $8, or free over $100 after discounts. Return unworn
              pieces within 30 days. <Link to="/info/shipping">Read the policy.</Link>
            </p>
          </details>
        </section>
      </div>
      <section className="section">
        <SectionTitle
          eyebrow="GOOD COMPANY FOR YOUR NEW FAVORITE"
          title="You might also like."
          link="See all pieces"
          href={`/shop/${p.category}`}
        />
        {related.data && (
          <ProductGrid
            products={related.data.products
              .filter((item) => item._id !== p._id)
              .slice(0, 4)}
          />
        )}
      </section>
      <dialog ref={dialog} className="guide-dialog">
        <div className="row-between">
          <h2>Find your fit.</h2>
          <button
            className="icon-button"
            aria-label="Close size guide"
            onClick={() => dialog.current?.close()}
          >
            <X />
          </button>
        </div>
        <p>
          General size reference. Fit varies by piece; confirm measurements with support
          before ordering.
        </p>
        <table>
          <thead>
            <tr>
              <th>Label</th>
              <th>Fit reference</th>
            </tr>
          </thead>
          <tbody>
            {sizes.map((s, i) => (
              <tr key={s}>
                <td>{s}</td>
                <td>{["Extra small", "Small", "Medium", "Large", "Extra large"][i]}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="small">
          Kids sizes use the same labels within the kids collection and are not equivalent
          to adult sizing.
        </p>
        <Link className="text-link" to="/contact">
          Ask a sizing question <ArrowRight size={16} />
        </Link>
      </dialog>
    </div>
  );
}
