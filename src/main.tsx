import { StrictMode, Suspense, lazy, Component, type ReactNode } from "react";
import { createRoot } from "react-dom/client";
import { HashRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StoreProvider, useStore } from "./store";
import { ApiError } from "./api";
import Layout from "./components/Layout";
import { EmptyState, Loading } from "./components/UI";
import Home from "./pages/Home";
import "./styles.css";
const Shop = lazy(() => import("./pages/Shop"));
const Product = lazy(() => import("./pages/Product"));

const Cart = lazy(() => import("./pages/Cart"));
const Checkout = lazy(() => import("./pages/Checkout"));
const Orders = lazy(() => import("./pages/Orders"));
const Account = lazy(() => import("./pages/Account"));
const Wishlist = lazy(() => import("./pages/Wishlist"));

const Info = lazy(() => import("./pages/Info"));
const Contact = lazy(() => import("./pages/Info").then((m) => ({ default: m.Contact })));
const query = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 20000,
      retry: (count, error) =>
        !(error instanceof ApiError && [400, 401, 403, 404].includes(error.status)) &&
        count < 1,
      refetchOnWindowFocus: true,
    },
    mutations: { retry: false },
  },
});
function Protected({ children }: { children: ReactNode }) { return <>{children}</>; }
class ErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? (
      <div className="state-box">
        <h1>Let's start fresh.</h1>
        <p>Something unexpected happened.</p>
        <button className="button dark" onClick={() => window.location.reload()}>
          Reload Shopper
        </button>
      </div>
    ) : (
      this.props.children
    );
  }
}
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ErrorBoundary>
      <QueryClientProvider client={query}>
        <HashRouter>
          <StoreProvider>
            <Suspense fallback={<Loading />}>
              <Routes>
                <Route element={<Layout />}>
                  <Route index element={<Home />} />
                  <Route path="shop" element={<Shop />} />
                  <Route path="shop/:category" element={<Shop />} />
                  <Route path="product/:slug" element={<Product />} />
                  <Route path="login" element={<Navigate to="/account" replace />} />
                  <Route path="cart" element={<Cart />} />
                  <Route
                    path="checkout"
                    element={
                      <Protected>
                        <Checkout />
                      </Protected>
                    }
                  />
                  <Route
                    path="orders"
                    element={
                      <Protected>
                        <Orders />
                      </Protected>
                    }
                  />
                  <Route
                    path="account"
                    element={
                      <Protected>
                        <Account />
                      </Protected>
                    }
                  />
                  <Route
                    path="wishlist"
                    element={
                      <Protected>
                        <Wishlist />
                      </Protected>
                    }
                  />
                  <Route
                    path="admin"
                    element={
                      <Protected>
                        <Navigate to="/" replace />
                      </Protected>
                    }
                  />
                  <Route path="info/:page" element={<Info />} />
                  <Route path="contact" element={<Contact />} />
                  <Route
                    path="*"
                    element={
                      <EmptyState
                        title="A little off the beaten path."
                        description="This page doesn't exist. Your next favorite is back in the collection."
                      />
                    }
                  />
                </Route>
              </Routes>
            </Suspense>
          </StoreProvider>
        </HashRouter>
      </QueryClientProvider>
    </ErrorBoundary>
  </StrictMode>,
);
