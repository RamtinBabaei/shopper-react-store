import { createContext, useContext, useState, useEffect, useRef, type ReactNode } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { CartLine, Product, Size } from './shared';
import { api, demoUser, json } from './api';
function useLocalStore() {
  const query=useQueryClient();
  const [cartBusy,setBusy]=useState(false), [toast,setToast]=useState('');
  const busy=useRef(false), timer=useRef<ReturnType<typeof setTimeout>|null>(null);
  useEffect(()=>()=>{if(timer.current) clearTimeout(timer.current);},[]);
  const cart=useQuery({queryKey:['cart'],queryFn:()=>api<{items:CartLine[]}>('/cart')});
  function notice(text:string) {setToast(text);if(timer.current) clearTimeout(timer.current);timer.current=setTimeout(()=>setToast(''),5000);}
  async function refreshCart() {await query.invalidateQueries({queryKey:['cart']});}
  async function mutate(path:string,method:string,body:unknown) {
    if(busy.current) throw new Error('Please wait for your bag to update');
    busy.current=true;setBusy(true);
    try {await api(path,{method,body:json(body)});await refreshCart();} finally {busy.current=false;setBusy(false);}
  }
  async function add(p:Product,size:Size,quantity=1) {await mutate('/cart/items','POST',{productId:p._id,size,quantity});notice('Added to your bag');}
  async function quantity(id:string,size:Size,quantity:number) {await mutate(`/cart/items/${id}/${size}`,'PATCH',{quantity});}
  return {user:demoUser,items:cart.data?.items||[],cartBusy,cartLoading:cart.isPending,cartError:cart.error,notice,refreshCart,add,quantity,toast};
}
const Context=createContext<ReturnType<typeof useLocalStore>|null>(null);
export function StoreProvider({children}:{children:ReactNode}) {
  const store=useLocalStore();
  return <Context.Provider value={store}>{children}<div className={`toast ${store.toast?'visible':''}`} role="status" aria-live="polite">{store.toast}</div></Context.Provider>;
}
export function useStore() {const value=useContext(Context);if(!value)throw new Error('StoreProvider is missing');return value;}
