import { useState } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { SlidersHorizontal, X, ArrowLeft, ArrowRight } from "lucide-react";
import { sizes, type Product } from "../shared";
import { api } from "../api";
import {
  PageHeading,
  ProductGrid,
  Loading,
  ErrorState,
  EmptyState,
} from "../components/UI";
export default function Shop() {
  const { category } = useParams();
  const [params, setParams] = useSearchParams();
  const [filters, setFilters] = useState(false);
  const q = params.get("q") || "";
  const sort = params.get("sort") || "newest";
  const size = params.get("size") || "";
  const max = params.get("max") || "";
  const page = Number(params.get("page") || 1);
  const queryString = new URLSearchParams(params);
  if (category) queryString.set("category", category);
  queryString.set("limit", "12");
  const result = useQuery({
    queryKey: ["products", category, params.toString()],
    queryFn: ({ signal }) =>
      api<{ products: Product[]; total: number; pages: number }>(
        `/products?${queryString}`,
        { signal },
      ),
  });
  function filter(key: string, value: string) {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    if (key !== "page") next.delete("page");
    setParams(next);
  }
  return (
    <div className="container shop-page">
      <PageHeading
        eyebrow="CONSIDERED PIECES. EVERYDAY POSSIBILITIES."
        title={
          q
            ? `A little search for “${q}”.`
            : category === "women"
              ? "The women’s edit."
              : category === "men"
                ? "The men’s edit."
                : category === "kids"
                  ? "Little people. Big style."
                  : "Your next everyday favorite."
        }
        description={
          q
            ? "Discover the pieces that feel like you."
            : "A fresh perspective on the pieces you live in."
        }
      />
      <div className="shop-toolbar">
        <p>
          {result.data
            ? `${result.data.total} pieces to make your own`
            : "Finding your favorites…"}
        </p>
        <div>
          <button
            className="filter-toggle"
            onClick={() => setFilters(!filters)}
            aria-expanded={filters}
          >
            <SlidersHorizontal size={17} /> Filters {Boolean(size || max) && "•"}
          </button>
          <label className="sort-label">
            Sort by{" "}
            <select
              aria-label="Sort products"
              value={sort}
              onChange={(e) => filter("sort", e.target.value)}
            >
              <option value="newest">Newest arrivals</option>
              <option value="featured">Our favorites</option>
              <option value="price-asc">Price: low to high</option>
              <option value="price-desc">Price: high to low</option>
            </select>
          </label>
        </div>
      </div>
      <div className="shop-layout">
        <aside
          className={`filter-panel ${filters ? "shown" : ""}`}
          aria-label="Filter products"
        >
          <div className="row-between">
            <h2>Refine your edit</h2>
            {(size || max || q) && (
              <button className="muted-link" onClick={() => setParams({})}>
                Clear all
              </button>
            )}
          </div>
          <div className="filter-group">
            <h3>Collection</h3>
            {[
              { label: "All pieces", value: "" },
              { label: "Women", value: "women" },
              { label: "Men", value: "men" },
              { label: "Kids", value: "kids" },
            ].map((c) => (
              <Link
                to={c.value ? `/shop/${c.value}` : "/shop"}
                className={
                  category === c.value || (!category && !c.value)
                    ? "filter-category selected"
                    : "filter-category"
                }
                key={c.label}
              >
                <span className="filter-circle" />
                {c.label}
              </Link>
            ))}
          </div>
          <div className="filter-group">
            <h3>Your size</h3>
            <div className="size-pills">
              {sizes.map((s) => (
                <button
                  key={s}
                  aria-pressed={size === s}
                  className={size === s ? "selected" : ""}
                  onClick={() => filter("size", size === s ? "" : s)}
                >
                  {s}
                </button>
              ))}
            </div>
            <p className="small muted">Only show sizes in stock.</p>
          </div>
          <div className="filter-group">
            <h3>Your budget</h3>
            <label className="sr-only" htmlFor="price-filter">
              Maximum price
            </label>
            <select
              id="price-filter"
              value={max}
              onChange={(e) => filter("max", e.target.value)}
            >
              <option value="">Any price</option>
              <option value="6000">Up to $60</option>
              <option value="8500">Up to $85</option>
              <option value="10000">Up to $100</option>
            </select>
          </div>
          <div className="filter-note">
            <span>THE EVERYDAY PROMISE</span>
            <p>Good style shouldn't be complicated.</p>
            <Link to="/info/about">
              Meet Shopper <ArrowRight size={14} />
            </Link>
          </div>
        </aside>
        <section className="shop-results" aria-label="Product results">
          {(size || max || q) && (
            <div className="filter-chips">
              {q && (
                <button onClick={() => filter("q", "")}>
                  {q}
                  <X size={12} />
                </button>
              )}
              {size && (
                <button onClick={() => filter("size", "")}>
                  Size {size}
                  <X size={12} />
                </button>
              )}
              {max && (
                <button onClick={() => filter("max", "")}>
                  Up to ${Number(max) / 100}
                  <X size={12} />
                </button>
              )}
            </div>
          )}
          {result.isPending ? (
            <Loading cards />
          ) : result.error ? (
            <ErrorState error={result.error} retry={() => result.refetch()} />
          ) : result.data.products.length ? (
            <>
              <ProductGrid products={result.data.products} />
              {result.data.pages > 1 && (
                <nav className="pagination" aria-label="Product pages">
                  <button
                    aria-label="Previous page"
                    disabled={page <= 1}
                    onClick={() => filter("page", String(page - 1))}
                  >
                    <ArrowLeft size={16} />
                  </button>
                  {Array.from({ length: result.data.pages }, (_, i) => i + 1).map((p) => (
                    <button
                      key={p}
                      aria-label={`Page ${p}`}
                      aria-current={p === page ? "page" : undefined}
                      className={p === page ? "selected" : ""}
                      onClick={() => filter("page", String(p))}
                    >
                      {p}
                    </button>
                  ))}
                  <button
                    aria-label="Next page"
                    disabled={page >= result.data.pages}
                    onClick={() => filter("page", String(page + 1))}
                  >
                    <ArrowRight size={16} />
                  </button>
                </nav>
              )}
            </>
          ) : (
            <EmptyState
              title="A fresh start?"
              description="No pieces match these filters. Try another size, price or search."
            />
          )}
        </section>
      </div>
    </div>
  );
}
