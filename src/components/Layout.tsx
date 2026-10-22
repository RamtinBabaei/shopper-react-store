import { useRef, useState, useEffect, type FormEvent } from "react";
import { Link, NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";
import {
  Search,
  ShoppingBag,
  UserRound,
  Heart,
  Menu,
  X,
  ArrowRight,
  ArrowUpRight,
  Truck,
  PackageCheck,
  ShieldCheck,
} from "lucide-react";
import { useStore } from "../store";
import { api, json } from "../api";
import { FormError } from "./UI";
export function Brand() {
  return (
    <Link className="brand" to="/" aria-label="Shopper home">
      <ShoppingBag strokeWidth={1.6} size={25} />
      <span>
        SHOPPER<span className="brand-dot">.</span>
      </span>
    </Link>
  );
}
export function Newsletter() {
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setBusy(true);
    setError("");
    try {
      await api("/newsletter", {
        method: "POST",
        body: json({
          email: f.get("email"),
          consent: f.get("consent") === "on",
        }),
      });
      setDone(true);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="newsletter">
      <div>
        <p className="eyebrow">A LITTLE SOMETHING FOR YOU</p>
        <h2>Good things. In your inbox.</h2>
        <p>Demo newsletter form — no emails are sent.</p>
      </div>
      {done ? (
        <p className="newsletter-success" role="status">
          Demo complete. No subscription was created.
          <br />
          <strong>Use WELCOME10 for 10% off.</strong>
        </p>
      ) : (
        <form onSubmit={submit}>
          <div className="subscribe-field">
            <label className="sr-only" htmlFor="newsletter-email">
              Email address
            </label>
            <input
              required
              id="newsletter-email"
              name="email"
              type="email"
              placeholder="Your email address"
              autoComplete="email"
              maxLength={254}
            />
            <button type="submit" aria-label="Subscribe to newsletter" disabled={busy}>
              {busy ? "…" : <ArrowRight size={22} />}
            </button>
          </div>
          <label className="check-label">
            <input type="checkbox" name="consent" required /> I agree to receive
            collection emails. <Link to="/info/privacy">Privacy</Link>
          </label>
          <FormError message={error} />
        </form>
      )}
    </section>
  );
}
export function Benefits() {
  return (
    <section className="benefits" aria-label="Shopping benefits">
      <div>
        <Truck />
        <p>
          <strong>A little extra, on us</strong>
          <span>Free shipping on orders over $100</span>
        </p>
      </div>
      <div>
        <PackageCheck />
        <p>
          <strong>Find your perfect fit</strong>
          <span>30-day returns on unworn pieces</span>
        </p>
      </div>
      <div>
        <ShieldCheck />
        <p>
          <strong>Shop with confidence</strong>
          <span>Portfolio demo — no real payments</span>
        </p>
      </div>
    </section>
  );
}
export default function Layout() {
  const { user, items } = useStore();
  const [mobile, setMobile] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const navigate = useNavigate();
  const location = useLocation();
  useEffect(() => {
    setMobile(false);
    dialog.current?.close();
    window.scrollTo(0, 0);
    document.title =
      location.pathname === "/"
        ? "Shopper — The new everyday"
        : `${location.pathname.split("/")[1].replace(/^./, (s) => s.toUpperCase())} — Shopper`;
  }, [location.pathname, location.search]);
  function search(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const q = String(new FormData(e.currentTarget).get("q") || "").trim();
    dialog.current?.close();
    navigate(`/shop${q ? `?q=${encodeURIComponent(q)}` : ""}`);
  }
  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <div className="announcement">
        YOUR EVERYDAY, REIMAGINED <span>—</span> FREE SHIPPING OVER $100{" "}
        <ArrowUpRight size={13} />
      </div>
      <header className="site-header">
        <div className="header-inner">
          <button
            className="icon-button mobile-toggle"
            aria-label={mobile ? "Close menu" : "Open menu"}
            aria-expanded={mobile}
            aria-controls="primary-nav"
            onClick={() => setMobile(!mobile)}
          >
            {mobile ? <X /> : <Menu />}
          </button>
          <Brand />
          <nav
            id="primary-nav"
            className={mobile ? "primary-nav open" : "primary-nav"}
            aria-label="Main navigation"
          >
            <NavLink to="/" end>
              Home
            </NavLink>
            <NavLink to="/shop" end>
              Shop all
            </NavLink>
            {["women", "men", "kids"].map((c) => (
              <NavLink to={`/shop/${c}`} key={c}>
                {c === "kids" ? "Kids" : c === "women" ? "Women" : "Men"}
              </NavLink>
            ))}
          </nav>
          <div className="header-actions">
            <button
              className="icon-button"
              aria-label="Search products"
              onClick={() => dialog.current?.showModal()}
            >
              <Search size={21} />
            </button>
            <Link
              className="icon-button account-button"
              to={user ? "/account" : "/login"}
              aria-label={user ? "My account" : "Sign in"}
            >
              <UserRound size={20} />
            </Link>
            <Link
              className="icon-button wishlist-link"
              to="/wishlist"
              aria-label="Saved pieces"
            >
              <Heart size={20} />
            </Link>
            <Link
              className="icon-button bag-link"
              to="/cart"
              aria-label={`Shopping bag, ${items.reduce((a, i) => a + i.quantity, 0)} items`}
            >
              <ShoppingBag size={21} />
              <span className="bag-count">
                {items.reduce((a, i) => a + i.quantity, 0)}
              </span>
            </Link>
          </div>
        </div>
      </header>
      <main id="main">
        <div className="demo-note" style={{margin: 0, textAlign: "center"}}>Frontend portfolio demo · Browser-only data · No real purchases or email delivery</div><Outlet />
      </main>
      <footer className="site-footer">
        <div className="footer-top">
          <div className="footer-about">
            <Brand />
            <p>
              Considered pieces.
              <br />
              Everyday possibilities.
            </p>
            <p className="small">A full-stack fashion store by Ramtin Babae.</p>
          </div>
          <div>
            <h3>The collection</h3>
            <Link to="/shop/women">Women</Link>
            <Link to="/shop/men">Men</Link>
            <Link to="/shop/kids">Kids</Link>
            <Link to="/shop">Shop everything</Link>
          </div>
          <div>
            <h3>Here to help</h3>
            <Link to="/orders">Your orders</Link>
            <Link to="/info/shipping">Shipping & returns</Link>
            <Link to="/info/size-guide">Size guide</Link>
            <Link to="/contact">Contact us</Link>
          </div>
          <div>
            <h3>A little more</h3>
            <Link to="/info/about">About Shopper</Link>
            <Link to="/info/privacy">Privacy</Link>
            <Link to="/info/terms">Terms of use</Link>
            <Link to="/admin">
              Store management <ArrowUpRight size={13} />
            </Link>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} Shopper. Portfolio demonstration.</p>
          <p>Thoughtfully built. Worn your way.</p>
          <div className="payment-labels">
            <span>VISA</span>
            <span>Mastercard</span>
            <span>COD</span>
          </div>
        </div>
      </footer>
      <dialog
        ref={dialog}
        className="search-dialog"
        onClick={(e) => {
          if (e.target === dialog.current) dialog.current.close();
        }}
      >
        <div className="search-inner">
          <div className="row-between">
            <p className="eyebrow">FIND YOUR NEXT FAVORITE</p>
            <button
              className="icon-button"
              aria-label="Close search"
              onClick={() => dialog.current?.close()}
            >
              <X />
            </button>
          </div>
          <form onSubmit={search}>
            <label htmlFor="product-search">What are you looking for?</label>
            <div className="search-field">
              <Search />
              <input
                id="product-search"
                name="q"
                autoFocus
                placeholder="Try jacket, knit, denim…"
                maxLength={100}
              />
              <button className="button dark" type="submit">
                Search <ArrowRight size={18} />
              </button>
            </div>
          </form>
          <div className="search-suggestions">
            Explore <Link to="/shop/women">Women</Link>
            <Link to="/shop/men">Men</Link>
            <Link to="/shop/kids">Kids</Link>
          </div>
        </div>
      </dialog>
    </>
  );
}
