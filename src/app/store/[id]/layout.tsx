import { CartProvider } from "@/src/context/CartContext";

export default function StoreLayout({
    children,
  }: Readonly<{
    children: React.ReactNode;
  }>) {
    return (
      <CartProvider>
          {children}
      </CartProvider>
    );
}
