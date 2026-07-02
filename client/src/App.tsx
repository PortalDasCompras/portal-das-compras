import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { CartProvider } from "./contexts/CartContext";
import { WishlistProvider } from "./contexts/WishlistContext";
import { AdminProvider } from "./contexts/AdminContext";
import StoreLayout from "./components/StoreLayout";
import AdminRoute from "./components/AdminRoute";

import Home from "./pages/Home";
import TodosProdutos from "./pages/TodosProdutos";
import Categorias from "./pages/Categorias";
import Categoria from "./pages/Categoria";
import Produto from "./pages/Produto";
import Carrinho from "./pages/Carrinho";
import Checkout from "./pages/Checkout";
import PedidoConfirmado from "./pages/PedidoConfirmado";
import Favoritos from "./pages/Favoritos";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";

function Router() {
  return (
    <Switch>
      {/* Store pages with layout */}
      <Route path="/">
        <StoreLayout><Home /></StoreLayout>
      </Route>
      <Route path="/todos-produtos">
        <StoreLayout><TodosProdutos /></StoreLayout>
      </Route>
      <Route path="/categorias">
        <StoreLayout><Categorias /></StoreLayout>
      </Route>
      <Route path="/categoria/:slug">
        {(params) => <StoreLayout><Categoria /></StoreLayout>}
      </Route>
      <Route path="/produto/:id">
        {(params) => <StoreLayout><Produto /></StoreLayout>}
      </Route>
      <Route path="/carrinho">
        <StoreLayout><Carrinho /></StoreLayout>
      </Route>
      <Route path="/checkout">
        <StoreLayout><Checkout /></StoreLayout>
      </Route>
      <Route path="/pedido-confirmado">
        <StoreLayout><PedidoConfirmado /></StoreLayout>
      </Route>
      <Route path="/favoritos">
        <StoreLayout><Favoritos /></StoreLayout>
      </Route>

      {/* Admin pages (no store layout) */}
      <Route path="/admin">
        <AdminLogin />
      </Route>
      <Route path="/admin/dashboard">
        <AdminRoute><AdminDashboard /></AdminRoute>
      </Route>

      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <CartProvider>
          <WishlistProvider>
            <AdminProvider>
              <TooltipProvider>
                <Toaster />
                <Router />
              </TooltipProvider>
            </AdminProvider>
          </WishlistProvider>
        </CartProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
