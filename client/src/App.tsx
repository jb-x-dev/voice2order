import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { CartProvider } from "./contexts/CartContext";
import Home from "./pages/Home";
import OrderDetail from "./pages/OrderDetail";
import Demo from "./pages/Demo";
import Articles from "./pages/Articles";
import Catalog from "./pages/Catalog";
import Suppliers from "./pages/Suppliers";
import OrderSuggestions from "./pages/OrderSuggestions";
import PrintQRCodes from "./pages/PrintQRCodes";
import Cart from "./pages/Cart";

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path="/demo" component={Demo} />
      <Route path="/catalog" component={Catalog} />      <Route path={"/suppliers"} component={Suppliers} />
      <Route path={"/order-suggestions"} component={OrderSuggestions} />      <Route path="/cart" component={Cart} />
      <Route path="/articles" component={Articles} />
      <Route path="/print-qr-codes" component={PrintQRCodes} />
      <Route path={"/order/:id"} component={OrderDetail} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
        // switchable
      >
        <CartProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </CartProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;

