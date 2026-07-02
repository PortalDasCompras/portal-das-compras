import { Link, useLocation } from "wouter";
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from "lucide-react";
import { useCart } from "@/contexts/CartContext";

export default function Carrinho() {
  const { items, removeItem, updateQuantity, totalPrice } = useCart();
  const [, navigate] = useLocation();

  if (items.length === 0) {
    return (
      <div className="container py-16 text-center">
        <ShoppingBag className="w-16 h-16 mx-auto text-gray-300 mb-4" />
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Seu carrinho está vazio</h1>
        <p className="text-gray-500 mb-6">Adicione produtos para continuar comprando.</p>
        <Link href="/">
          <button className="bg-red-600 hover:bg-red-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors">
            Ver produtos
          </button>
        </Link>
      </div>
    );
  }

  const shipping = totalPrice >= 150 ? 0 : 19.90;
  const total = totalPrice + shipping;

  return (
    <div className="container py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Carrinho de compras</h1>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Items */}
        <div className="lg:col-span-2 space-y-3">
          {items.map(item => (
            <div key={item.productId} className="bg-white rounded-xl border border-gray-100 p-4 flex gap-4 shadow-sm">
              <img
                src={item.image}
                alt={item.name}
                className="w-20 h-20 object-cover rounded-lg flex-shrink-0 bg-gray-50"
              />
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-gray-800 line-clamp-2 mb-1">{item.name}</h3>
                <p className="text-base font-bold text-gray-900">
                  R$ {item.price.toFixed(2).replace(".", ",")}
                </p>

                <div className="flex items-center gap-3 mt-3">
                  {/* Quantity */}
                  <div className="flex items-center gap-1 border border-gray-200 rounded-lg">
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                      className="p-1.5 hover:bg-gray-50 transition-colors rounded-l-lg"
                    >
                      <Minus className="w-3.5 h-3.5 text-gray-600" />
                    </button>
                    <span className="w-8 text-center text-sm font-semibold">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                      className="p-1.5 hover:bg-gray-50 transition-colors rounded-r-lg"
                    >
                      <Plus className="w-3.5 h-3.5 text-gray-600" />
                    </button>
                  </div>

                  <span className="text-sm text-gray-500">
                    Subtotal: <strong className="text-gray-800">R$ {(item.price * item.quantity).toFixed(2).replace(".", ",")}</strong>
                  </span>

                  <button
                    onClick={() => removeItem(item.productId)}
                    className="ml-auto p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                    aria-label="Remover item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm sticky top-24">
            <h2 className="font-bold text-gray-900 mb-4">Resumo do pedido</h2>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>R$ {totalPrice.toFixed(2).replace(".", ",")}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Frete</span>
                <span className={shipping === 0 ? "text-green-600 font-medium" : ""}>
                  {shipping === 0 ? "Grátis" : `R$ ${shipping.toFixed(2).replace(".", ",")}`}
                </span>
              </div>
              {shipping > 0 && (
                <p className="text-xs text-gray-400">Frete grátis para compras acima de R$ 150,00</p>
              )}
              <div className="border-t border-gray-100 pt-2 flex justify-between font-bold text-base text-gray-900">
                <span>Total</span>
                <span>R$ {total.toFixed(2).replace(".", ",")}</span>
              </div>
            </div>

            <button
              onClick={() => navigate("/checkout")}
              className="mt-5 w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3.5 rounded-xl transition-all duration-150 active:scale-[0.97] flex items-center justify-center gap-2 shadow-md"
            >
              Finalizar compra
              <ArrowRight className="w-4 h-4" />
            </button>

            <Link href="/" className="block text-center mt-3 text-sm text-gray-500 hover:text-red-600 transition-colors">
              Continuar comprando
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
