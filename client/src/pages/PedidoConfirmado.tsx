import { Link } from "wouter";
import { CheckCircle, Package, ShoppingBag } from "lucide-react";

export default function PedidoConfirmado() {
  return (
    <div className="container py-16 text-center max-w-lg mx-auto">
      <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-9 h-9 text-green-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Pedido confirmado!</h1>
        <p className="text-gray-500 mb-6">
          Seu pedido foi recebido com sucesso. Você receberá um e-mail de confirmação em breve com os detalhes e código de rastreio.
        </p>

        <div className="bg-gray-50 rounded-xl p-4 mb-6 text-left space-y-2">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Package className="w-4 h-4 text-red-500" />
            <span>Prazo de entrega: 1 a 3 dias úteis</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span>Pagamento em análise</span>
          </div>
        </div>

        <Link href="/">
          <button className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2">
            <ShoppingBag className="w-4 h-4" />
            Continuar comprando
          </button>
        </Link>
      </div>
    </div>
  );
}
