import { products } from './catalog';
import { calculateTotals, checkoutSchema, sizes, type CartLine, type Order, type Size } from './shared';
export class ApiError extends Error {
  constructor(public status: number, public code: string, message: string, public details?: {field: string; message: string}[]) { super(message); }
}
export const json = (body: unknown) => JSON.stringify(body);
const prefix = 'shopper-frontend-';
export function read<T>(key: string, fallback: T): T {
  try { return JSON.parse(localStorage.getItem(prefix + key) || 'null') ?? fallback; } catch { return fallback; }
}
function save(key: string, value: unknown) { localStorage.setItem(prefix + key, json(value)); }
export const demoUser = {_id: 'demo', name: 'Demo Visitor', email: 'visitor@example.com', role: 'customer' as const};
export async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  if (options.signal?.aborted) throw new DOMException('Aborted', 'AbortError');
  const url = new URL(path, 'https://frontend.invalid');
  const route = url.pathname;
  const method = options.method || 'GET';
  const body = options.body ? JSON.parse(String(options.body)) : {};
  const result = (): unknown => {
    if (route === '/auth/me') return {user: demoUser};
    if (route === '/config') return {cardPayments: false, currency: 'USD'};
    if (route === '/products') {
      const q = url.searchParams;
      let list = products.filter(p => (!q.get('category') || p.category === q.get('category')) && (!q.get('q') || (p.name+' '+p.color).toLowerCase().includes(q.get('q')!.toLowerCase())) && (!q.get('featured') || p.featured) && (!q.get('max') || p.price <= Number(q.get('max'))) && (!q.get('size') || p.stock[q.get('size') as Size] > 0));
      const sort = q.get('sort');
      list = [...list].sort((a,b) => sort === 'price-asc' ? a.price-b.price : sort === 'price-desc' ? b.price-a.price : sort === 'featured' ? Number(b.featured)-Number(a.featured) : b.createdAt.localeCompare(a.createdAt));
      const limit = Math.max(1, Math.min(100, Number(q.get('limit')) || 12));
      const page = Math.max(1, Number(q.get('page')) || 1);
      return {products: list.slice((page-1)*limit,page*limit),total:list.length,pages:Math.ceil(list.length/limit)};
    }
    if (route.startsWith('/products/')) {
      const product = products.find(p => p.slug === decodeURIComponent(route.split('/')[2]));
      if (!product) throw new ApiError(404,'NOT_FOUND','Product not found');
      return {product};
    }
    if (route.startsWith('/wishlist')) {
      let ids = read<string[]>('wishlist',[]);
      const id = route.split('/')[2];
      if (id && method !== 'GET') { ids = (method === 'DELETE' || body.saved === false) ? ids.filter(i=>i!==id) : [...new Set([...ids,id])]; save('wishlist',ids); }
      return {products: products.filter(p=>ids.includes(p._id))};
    }
    let cart = read<CartLine[]>('cart',[]);
    if (route === '/cart') return {items:cart};
    if (route === '/cart/items' && method === 'POST') {
      const product = products.find(p=>p._id===body.productId);
      if (!product || !sizes.includes(body.size)) throw new Error('Choose an available product and size');
      const current = cart.find(i=>i.productId===body.productId && i.size===body.size);
      const quantity = (current?.quantity || 0)+body.quantity;
      if (!Number.isInteger(quantity) || quantity < 1 || quantity > Math.min(10,product.stock[body.size as Size])) throw new Error('That quantity is not available');
      if (current) current.quantity=quantity; else cart.push({productId:product._id,product,size:body.size,quantity});
      save('cart',cart); return {items:cart};
    }
    if (route.startsWith('/cart/items/') && method==='PATCH') {
      const [, , ,id,size] = route.split('/');
      const quantity = body.quantity;
      const product = products.find(p=>p._id===id);
      if (!product || !sizes.includes(size as Size) || !Number.isInteger(quantity) || quantity<0 || quantity>Math.min(10,product.stock[size as Size])) throw new Error('That quantity is not available');
      cart = quantity===0 ? cart.filter(i=>!(i.productId===id && i.size===size)) : cart.map(i=>i.productId===id && i.size===size ? {...i,quantity}:i);
      save('cart',cart); return {items:cart};
    }
    if (route==='/cart/merge') return {skipped:[]};
    let orders=read<Order[]>('orders',[]);
    if (route==='/orders' && method==='POST') {
      const input=checkoutSchema.parse(body);
      if (input.paymentMethod!=='cod') throw new Error('Real payments are not supported');
      const key=new Headers(options.headers).get('Idempotency-Key');
      const previous=key ? read<string|null>('request-'+key,null):null;
      if(previous) return {order:orders.find(o=>o._id===previous)};
      if(!cart.length) throw new Error('Your bag is empty');
      const id=crypto.randomUUID(), now=new Date().toISOString();
      const order:Order={_id:id,number:'DEMO-'+id.slice(0,8).toUpperCase(),user:'demo',items:cart.map(i=>({productId:i.productId,size:i.size,quantity:i.quantity,name:i.product.name,image:i.product.images[0],price:i.product.price})),address:input.address,paymentMethod:'cod',paymentStatus:'unpaid',status:'placed',totals:calculateTotals(cart.map(i=>({price:i.product.price,quantity:i.quantity})),input.coupon),currency:'USD',createdAt:now,updatedAt:now};
      orders.unshift(order); save('orders',orders); save('cart',[]); if(key) save('request-'+key,id); return {order};
    }
    if(route==='/orders') { const page=Math.max(1,Number(url.searchParams.get('page'))||1); return {orders:orders.slice((page-1)*10,page*10),pages:Math.ceil(orders.length/10)}; }
    if(route.endsWith('/cancel')) { const id=route.split('/')[2]; orders=orders.map(o=>o._id===id?{...o,status:'cancelled',updatedAt:new Date().toISOString()}:o);save('orders',orders);return {}; }
    if(route==='/newsletter' || route==='/messages') return {demo:true};
    throw new ApiError(404,'DEMO_ONLY','This feature requires a backend and is not part of the frontend demo.');
  };
  return structuredClone(result()) as T;
}
