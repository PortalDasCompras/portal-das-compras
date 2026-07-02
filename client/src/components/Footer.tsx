import { ShoppingBag } from "lucide-react";
import { Link } from "wouter";

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 mt-16">
      <div className="container py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-red-700 font-bold">
            <ShoppingBag className="w-5 h-5" />
            <span>Portal das Compras</span>
          </div>
          <p className="text-sm text-gray-500 text-center">
            © 2026 Portal das Compras · Curadoria de achados imperdíveis
          </p>
          <p className="text-sm text-gray-500 text-center">
            Envio para todo o Brasil · Pagamento seguro
          </p>
        </div>
      </div>
    </footer>
  );
}
