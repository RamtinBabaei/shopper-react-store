import { useState, type FormEvent } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowRight, MessageCircle, Truck, PackageCheck } from "lucide-react";
import { api, json } from "../api";
import { PageHeading, FormError, EmptyState } from "../components/UI";
const content: Record<
  string,
  { eyebrow: string; title: string; blocks: { title: string; text: string }[] }
> = {
  about: {
    eyebrow: "A FRESH TAKE ON EVERYDAY",
    title: "A little more you.",
    blocks: [
      {
        title: "Style, with room to be yourself.",
        text: "Shopper is a fashion storefront inspired by the GreatStack MERN project, adapted for the portfolio of Ramtin Babaei as a portfolio application. Browse collections for women, men and kids, save your favorites and simulate checkout and view local demo orders.",
      },
      {
        title: "A considered shopping experience.",
        text: "Simple discovery, clear size availability and a shopping bag that stays in your browser. Every piece has a place, and every interaction has a purpose.",
      },
      {
        title: "Built to demonstrate real commerce.",
        text: "This is a demonstration store, not an operating retailer. Catalog images are educational reference assets supplied by GreatStack. Orders and shipping policies illustrate the experience; no physical goods are supplied.",
      },
    ],
  },
  shipping: {
    eyebrow: "FROM OUR COLLECTION TO YOUR EVERYDAY",
    title: "Shipping & returns.",
    blocks: [
      {
        title: "An easy journey.",
        text: "The demo checkout uses a flat $8 shipping fee and free standard shipping when the discounted merchandise subtotal is $100 or more. Delivery addresses are recorded with the order. No actual parcels are sent by this portfolio store.",
      },
      {
        title: "Room to find your fit.",
        text: "The illustrated return policy allows unworn pieces within 30 days of delivery. The contact form is a UI demonstration and does not send messages.",
      },
      {
        title: "Change of plans?",
        text: "You can cancel an unpaid order before packing from Your Orders. Cancellation updates only the local demo order. No stock is reserved and no money is charged.",
      },
    ],
  },
  "size-guide": {
    eyebrow: "FEEL GOOD IN YOUR FIT",
    title: "Find your fit.",
    blocks: [
      {
        title: "Start with your usual size.",
        text: "The collection uses XS, S, M, L and XL. Labels describe relative sizes within each collection. Kids labels are separate from adult labels. Fit varies by garment; these are not verified garment measurements.",
      },
      {
        title: "A little room makes a difference.",
        text: "Check availability on the product page and ask support for specific measurements before ordering. Out-of-stock sizes cannot be added to your bag.",
      },
    ],
  },
  privacy: { eyebrow: "BROWSER-ONLY DEMO", title: "Your demo data.", blocks: [{title: "Local storage", text: "Bag, favorites and fictional demo orders stay in this browser. There is no server account, password, payment service, tracking or email delivery. Do not enter real personal information. Clear site data to reset the demo."}] },
  terms: { eyebrow: "PORTFOLIO PROJECT", title: "Demonstration only.", blocks: [{title: "No real purchases", text: "This frontend project simulates product discovery and checkout. No payment is collected, no products are shipped and no emails are sent. Product images originate from the GreatStack reference assets; see THIRD_PARTY_NOTICES.md."}] },

};
export function Contact() {
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function send(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const f = new FormData(e.currentTarget);
    try {
      await api("/messages", {
        method: "POST",
        body: json({
          name: f.get("name"),
          email: f.get("email"),
          message: f.get("message"),
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
    <div className="container contact-page">
      <PageHeading
        eyebrow="HERE FOR THE LITTLE THINGS"
        title="Let's talk."
        description="Questions about a piece, a size or your order? Leave us a note."
      />
      <div className="contact-layout">
        <div className="contact-copy">
          <MessageCircle size={33} />
          <h2>
            Good conversations
            <br />
            start here.
          </h2>
          <p>
            This is a frontend demonstration. No message is sent. Include your order number if
            you're asking about a purchase.
          </p>
          <Link className="text-link" to="/info/shipping">
            <Truck size={18} /> Shipping & returns <ArrowRight size={16} />
          </Link>
          <Link className="text-link" to="/info/size-guide">
            <PackageCheck size={18} /> Find your fit <ArrowRight size={16} />
          </Link>
        </div>
        {done ? (
          <div className="contact-success" role="status">
            <h2>Thanks for saying hello.</h2>
            <p>Demo complete. Your message was not sent or stored.</p>
            <button className="text-link" onClick={() => setDone(false)}>
              Send another note <ArrowRight size={16} />
            </button>
          </div>
        ) : (
          <form onSubmit={send}>
            <div className="form-grid">
              <label>
                Your name
                <input
                  name="name"
                  autoComplete="name"
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
                  required
                  maxLength={254}
                />
              </label>
              <label className="span-2">
                Your message
                <textarea
                  name="message"
                  rows={7}
                  required
                  minLength={10}
                  maxLength={4000}
                  placeholder="Tell us a little more…"
                />
              </label>
            </div>
            <FormError message={error} />
            <button className="button dark" disabled={busy}>
              {busy ? "Sending…" : "Send your note"}
              <ArrowRight size={17} />
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
export default function Info() {
  const { page } = useParams();
  const item = content[page || ""];
  if (!item)
    return (
      <EmptyState
        title="A little off the beaten path."
        description="We couldn't find that page."
        action="Back to the collection"
      />
    );
  return (
    <article className="container info-page">
      <PageHeading eyebrow={item.eyebrow} title={item.title} />
      <div className="info-content">
        {item.blocks.map((b) => (
          <section key={b.title}>
            <h2>{b.title}</h2>
            <p>{b.text}</p>
          </section>
        ))}
        <Link className="text-link" to="/contact">
          A question on your mind? <ArrowRight size={16} />
        </Link>
      </div>
    </article>
  );
}
