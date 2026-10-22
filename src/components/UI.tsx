import { Link } from "react-router-dom";
import { ArrowRight, Heart, ShoppingBag, AlertCircle } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Product } from "../shared";
import { money } from "../shared";
import { api, json } from "../api";
import { useStore } from "../store";
import { useNavigate, useLocation } from "react-router-dom";
import type { ReactNode } from "react";
export function SectionTitle({
  eyebrow,
  title,
  link,
  href = "/shop",
}: {
  eyebrow: string;
  title: string;
  link?: string;
  href?: string;
}) {
  return (
    <div className="section-heading">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h2>{title}</h2>
      </div>
      {link && (
        <Link className="text-link" to={href}>
          {link}
          <ArrowRight size={17} />
        </Link>
      )}
    </div>
  );
}
export function ProductCard({
  product,
  priority = false,
}: {
  product: Product;
  priority?: boolean;
}) {
  const { user, notice } = useStore();
  const query = useQueryClient();
  const navigate = useNavigate();
  const location = useLocation();
  const saved = useQuery({
    queryKey: ["wishlist", user?._id],
    queryFn: () => api<{ products: Product[] }>("/wishlist"),
    enabled: Boolean(user),
  });
  const active = saved.data?.products.some((p) => p._id === product._id) || false;
  const mutation = useMutation({
    mutationFn: () =>
      api(`/wishlist/${product._id}`, {
        method: "POST",
        body: json({ saved: !active }),
      }),
    onSuccess: () => query.invalidateQueries({ queryKey: ["wishlist"] }),
    onError: (e) => notice(e.message),
  });
  const onSave = () => {
    if (!user) {
      navigate("/login", {
        state: { from: location.pathname + location.search },
      });
      return;
    }
    mutation.mutate();
  };
  const discount =
    product.compareAt > product.price
      ? Math.round((1 - product.price / product.compareAt) * 100)
      : 0;
  return (
    <article className="product-card">
      <div className="product-image">
        <Link to={`/product/${product.slug}`} aria-label={`View ${product.name}`}>
          <img
            src={product.images[0]}
            alt={product.name}
            width="350"
            height="418"
            loading={priority ? "eager" : "lazy"}
            decoding="async"
          />
        </Link>
        {discount > 0 && <span className="product-badge">−{discount}%</span>}
        <button
          className={`save-button ${active ? "saved" : ""}`}
          aria-label={`${active ? "Unsave" : "Save"} ${product.name}`}
          disabled={mutation.isPending}
          onClick={onSave}
        >
          <Heart size={18} fill={active ? "currentColor" : "none"} />
        </button>
        <Link className="view-piece" to={`/product/${product.slug}`}>
          Discover piece <ArrowRight size={15} />
        </Link>
      </div>
      <div className="product-meta">
        <p className="product-category">
          {product.category} / {product.color}
        </p>
        <Link to={`/product/${product.slug}`} className="product-name">
          {product.name}
        </Link>
        <p className="price">
          {money(product.price)}{" "}
          {product.compareAt > product.price && <del>{money(product.compareAt)}</del>}
        </p>
      </div>
    </article>
  );
}
export function ProductGrid({ products }: { products: Product[] }) {
  return (
    <div className="product-grid">
      {products.map((p) => (
        <ProductCard key={p._id} product={p} />
      ))}
    </div>
  );
}
export function Loading({ cards = false }: { cards?: boolean }) {
  return cards ? (
    <div className="product-grid" aria-label="Loading products">
      {[1, 2, 3, 4].map((i) => (
        <div className="skeleton-card" key={i}>
          <div />
          <span />
          <span />
        </div>
      ))}
    </div>
  ) : (
    <div className="loading-state" role="status">
      <span className="spinner" /> Loading…
    </div>
  );
}
export function ErrorState({ error, retry }: { error: Error; retry?: () => void }) {
  return (
    <div className="state-box" role="alert">
      <AlertCircle size={28} />
      <h2>Let's try that again.</h2>
      <p>{error.message}</p>
      {retry && (
        <button className="button dark" onClick={retry}>
          Try again
        </button>
      )}
    </div>
  );
}
export function EmptyState({
  title,
  description,
  action = "Explore the collection",
  href = "/shop",
  icon = <ShoppingBag size={36} />,
}: {
  title: string;
  description: string;
  action?: string;
  href?: string;
  icon?: ReactNode;
}) {
  return (
    <div className="state-box">
      {icon}
      <h2>{title}</h2>
      <p>{description}</p>
      <Link className="button dark" to={href}>
        {action}
        <ArrowRight size={16} />
      </Link>
    </div>
  );
}
export function PageHeading({
  title,
  eyebrow,
  description,
}: {
  title: string;
  eyebrow: string;
  description?: string;
}) {
  return (
    <header className="page-heading">
      <p className="eyebrow">{eyebrow}</p>
      <h1>{title}</h1>
      {description && <p>{description}</p>}
    </header>
  );
}
export function FormError({ message }: { message: string }) {
  return message ? (
    <p className="form-error" role="alert">
      {message}
    </p>
  ) : null;
}
