import { Link } from "react-router-dom";
import { ArrowRight, ArrowUpRight, Plus } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { Product } from "../shared";
import { api } from "../api";
import { SectionTitle, ProductGrid, Loading, ErrorState } from "../components/UI";
import { Benefits, Newsletter } from "../components/Layout";
export default function Home() {
  const products = useQuery({
    queryKey: ["products", "home"],
    queryFn: ({ signal }) =>
      api<{ products: Product[] }>("/products?featured=true&sort=price-asc&limit=4", {
        signal,
      }),
  });
  return (
    <>
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">
            <span className="tiny-line" /> THE NEW EVERYDAY / EDIT 01
          </p>
          <h1>
            Good style.
            <br />
            Great days.
            <br />
            <em>Your way.</em>
          </h1>
          <p className="hero-description">
            Fresh perspectives. Effortless pieces.
            <br />
            Meet the collection made for your everyday.
          </p>
          <Link className="button dark" to="/shop">
            Explore the collection <ArrowRight size={18} />
          </Link>
          <div className="hero-footnote">
            <span className="footnote-mark">✳</span>
            <span>
              A NEW SEASON OF
              <br />
              FEELING LIKE YOURSELF.
            </span>
          </div>
        </div>
        <div className="hero-visual">
          <span className="hero-outline" aria-hidden="true">
            everyday
          </span>
          <span className="hero-vertical">INDIVIDUAL BY NATURE. SHOPPER BY CHOICE.</span>
          <img
            src="./images/hero-image.webp"
            width="613"
            height="842"
            alt="New-season relaxed style with an oversized tee and wide-leg denim"
            fetchPriority="high"
          />
          <Link className="hero-sticker" to="/shop/women">
            <span>
              THE
              <br />
              NEW EDIT
            </span>
            <ArrowUpRight size={30} />
          </Link>
          <div className="hero-caption">
            <span>01 — THE EVERYDAY COLLECTION</span>
            <span>2026</span>
          </div>
        </div>
      </section>
      <div className="collection-ticker" aria-label="Collection values">
        <span>LESS ORDINARY. MORE YOU.</span>
        <Plus size={14} />
        <span>EVERYDAY ESSENTIALS</span>
        <Plus size={14} />
        <span>FRESH FINDS, FAMILIAR FEELING</span>
        <Plus size={14} />
        <span>LESS ORDINARY. MORE YOU.</span>
      </div>
      <section className="section container">
        <SectionTitle
          eyebrow="THE PIECES YOU'LL REACH FOR"
          title="Current favorites."
          link="Shop the edit"
        />
        {products.isPending ? (
          <Loading cards />
        ) : products.error ? (
          <ErrorState error={products.error} retry={() => products.refetch()} />
        ) : (
          <ProductGrid products={products.data.products} />
        )}
      </section>
      <section className="category-section container">
        <SectionTitle eyebrow="A WARDROBE FOR EVERYONE" title="Find your everyday." />
        <div className="category-grid">
          {[
            {
              category: "women",
              image: 6,
              title: "For her.",
              subtitle: "A fresh point of view",
            },
            {
              category: "men",
              image: 17,
              title: "For him.",
              subtitle: "Everyday, elevated",
            },
            {
              category: "kids",
              image: 32,
              title: "For the little ones.",
              subtitle: "Big on personality",
            },
          ].map((c) => (
            <Link key={c.category} to={`/shop/${c.category}`} className="category-card">
              <img
                src={`./images/product-${c.image}.webp`}
                alt={`${c.category} collection`}
                width="350"
                height="418"
                loading="lazy"
              />
              <div>
                <p>{c.subtitle}</p>
                <h3>{c.title}</h3>
                <span className="circle-arrow">
                  <ArrowUpRight size={23} />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>
      <section className="editorial container">
        <div className="editorial-image">
          <span className="editorial-number">02</span>
          <img
            src="./images/exclusive-image.webp"
            alt="Shopper seasonal fashion edit"
            loading="lazy"
            width="494"
            height="613"
          />
        </div>
        <div className="editorial-copy">
          <p className="eyebrow">NOT JUST ANOTHER OUTFIT</p>
          <h2>
            A little less
            <br />
            expected.
            <br />
            <em>A lot more you.</em>
          </h2>
          <p>
            The best pieces don't change who you are. They give you more ways to show it.
            Discover a fresh take on getting dressed.
          </p>
          <Link className="text-link" to="/shop?sort=featured">
            Make it your own <ArrowRight size={18} />
          </Link>
        </div>
      </section>
      <div className="container">
        <Benefits />
        <Newsletter />
      </div>
    </>
  );
}
