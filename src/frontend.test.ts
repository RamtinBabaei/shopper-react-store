// Local commerce workflows; no server, network or database.
import { beforeEach, expect, test } from 'vitest';
import { api, json } from './api';
import { products } from './catalog';
import type { CartLine, Order } from './shared';
const storage=new Map<string,string>();
Object.defineProperty(globalThis,'localStorage',{value:{getItem:(k:string)=>storage.get(k)??null,setItem:(k:string,v:string)=>storage.set(k,v),removeItem:(k:string)=>storage.delete(k)}});
beforeEach(()=>storage.clear());
test('catalog filters, search and pagination work locally',async()=>{
 const r=await api<{products:typeof products,total:number}>('/products?category=women&q=pink&limit=1');
 expect(r.total).toBeGreaterThan(1);expect(r.products).toHaveLength(1);expect(r.products[0].category).toBe('women');
 const sorted=await api<{products:typeof products}>('/products?sort=price-asc');expect(sorted.products[0].price).toBe(5000);
});
test('bag persists, enforces stock, updates and removes lines',async()=>{
 const productId=products[0]._id;
 await api('/cart/items',{method:'POST',body:json({productId,size:'M',quantity:2})});
 expect((await api<{items:CartLine[]}>('/cart')).items[0].quantity).toBe(2);
 await expect(api('/cart/items',{method:'POST',body:json({productId,size:'M',quantity:10})})).rejects.toThrow();
 await api(`/cart/items/${productId}/M`,{method:'PATCH',body:json({quantity:0})});
 expect((await api<{items:CartLine[]}>('/cart')).items).toEqual([]);
});
test('favorites can be saved and removed',async()=>{
 const id=products[0]._id;await api('/wishlist/'+id,{method:'POST'});
 expect((await api<{products:typeof products}>('/wishlist')).products).toHaveLength(1);
 await api('/wishlist/'+id,{method:'POST',body:json({saved:false})});expect((await api<{products:typeof products}>('/wishlist')).products).toHaveLength(0);
});
test('demo checkout calculates discount, clears bag, deduplicates and cancels',async()=>{
 await api('/cart/items',{method:'POST',body:json({productId:products[0]._id,size:'M',quantity:2})});
 const options={method:'POST',headers:{'Idempotency-Key':'test'},body:json({address:{name:'Demo Visitor',email:'demo@example.com',phone:'123456789',street:'123 Demo Street',city:'Demo City',postalCode:'12345',country:'Demo Country'},paymentMethod:'cod',coupon:'WELCOME10'})};
 const {order}=await api<{order:Order}>('/orders',options);expect(order.totals.total).toBe(9800);
 expect((await api<{items:CartLine[]}>('/cart')).items).toHaveLength(0);
 expect((await api<{order:Order}>('/orders',options)).order._id).toBe(order._id);
 await api('/orders/'+order._id+'/cancel',{method:'POST'});
 expect((await api<{orders:Order[]}>('/orders')).orders[0].status).toBe('cancelled');
});
