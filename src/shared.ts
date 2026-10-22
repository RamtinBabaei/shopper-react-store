import { z } from "zod";

export const categories = ["women", "men", "kids"] as const;
export const sizes = ["XS", "S", "M", "L", "XL"] as const;
export const orderStates = [
  "placed",
  "packing",
  "shipped",
  "delivered",
  "cancelled",
] as const;
export type Category = (typeof categories)[number];
export type Size = (typeof sizes)[number];
export type OrderState = (typeof orderStates)[number];
export const idSchema = z.string().regex(/^[a-f\d]{24}$/i, "Invalid ID");
export const passwordSchema = z.string().min(10, "Use at least 10 characters").max(128);
export const registerSchema = z
  .object({
    name: z.string().trim().min(2).max(80),
    email: z.email().trim().toLowerCase().max(254),
    password: passwordSchema,
  })
  .strict();
export const loginSchema = z
  .object({
    email: z.email().trim().toLowerCase().max(254),
    password: z.string().min(1).max(128),
  })
  .strict();
export const cartItemSchema = z
  .object({
    productId: idSchema,
    size: z.enum(sizes),
    quantity: z.number().int().min(1).max(10),
  })
  .strict();
export const addressSchema = z
  .object({
    name: z.string().trim().min(2).max(80),
    email: z.email().trim().max(254),
    phone: z
      .string()
      .trim()
      .min(7)
      .max(30)
      .regex(/^[+\d\s().-]+$/),
    street: z.string().trim().min(4).max(160),
    city: z.string().trim().min(2).max(80),
    postalCode: z.string().trim().min(2).max(20),
    country: z.string().trim().min(2).max(80),
  })
  .strict();
export const checkoutSchema = z
  .object({
    address: addressSchema,
    paymentMethod: z.enum(["cod", "stripe"]),
    coupon: z.string().trim().max(30).default(""),
  })
  .strict();
export const imageSchema = z
  .string()
  .max(500)
  .refine(
    (s) =>
      /^\/(images|uploads)\/[a-zA-Z0-9_./-]+\.(webp|png|jpg|jpeg)$/.test(s) &&
      !s.includes(".."),
    "Use a local uploaded image",
  );
export const productSchema = z
  .object({
    name: z.string().trim().min(3).max(120),
    slug: z
      .string()
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
      .max(140),
    description: z.string().trim().min(20).max(4000),
    category: z.enum(categories),
    price: z.number().int().min(100).max(1000000),
    compareAt: z.number().int().min(0).max(2000000),
    images: z.array(imageSchema).min(1).max(5),
    color: z.string().trim().min(2).max(50),
    material: z.string().trim().min(2).max(150),
    stock: z
      .object({
        XS: z.number().int().min(0).max(100000),
        S: z.number().int().min(0).max(100000),
        M: z.number().int().min(0).max(100000),
        L: z.number().int().min(0).max(100000),
        XL: z.number().int().min(0).max(100000),
      })
      .strict(),
    featured: z.boolean(),
    active: z.boolean(),
  })
  .strict()
  .refine(
    (p) => p.compareAt === 0 || p.compareAt >= p.price,
    "Original price must be at least the selling price",
  );
export type ProductInput = z.infer<typeof productSchema>;
export type CartItem = z.infer<typeof cartItemSchema>;
export type Address = z.infer<typeof addressSchema>;
export type CheckoutInput = z.infer<typeof checkoutSchema>;
export interface Product extends ProductInput {
  _id: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}
export interface User {
  _id: string;
  name: string;
  email: string;
  role: "customer" | "admin";
}
export interface CartLine extends CartItem {
  product: Product;
}
export interface Totals {
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
}
export interface OrderLine extends CartItem {
  name: string;
  image: string;
  price: number;
}
export interface Order {
  _id: string;
  number: string;
  user: string;
  items: OrderLine[];
  address: Address;
  paymentMethod: "cod" | "stripe";
  paymentStatus: "unpaid" | "paid" | "expired" | "review";
  status: OrderState;
  totals: Totals;
  currency: string;
  createdAt: string;
  updatedAt: string;
  expiresAt?: string;
}
export const FREE_SHIPPING = 10000;
export const SHIPPING_FEE = 800;
export function calculateTotals(
  items: { price: number; quantity: number }[],
  coupon = "",
): Totals {
  if (
    items.some(
      (i) =>
        !Number.isSafeInteger(i.price) ||
        i.price < 0 ||
        !Number.isSafeInteger(i.quantity) ||
        i.quantity < 1,
    )
  )
    throw new Error("Invalid line item amount");
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  if (!Number.isSafeInteger(subtotal))
    throw new Error("Order amount exceeds the supported range");
  const discount = coupon.toUpperCase() === "WELCOME10" ? Math.floor(subtotal / 10) : 0;
  const shipping =
    subtotal === 0 || subtotal - discount >= FREE_SHIPPING ? 0 : SHIPPING_FEE;
  return {
    subtotal,
    discount,
    shipping,
    total: subtotal - discount + shipping,
  };
}
export function money(cents: number, currency = "USD") {
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(
    cents / 100,
  );
}
