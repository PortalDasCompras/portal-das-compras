import { useState } from "react";
import { Link } from "wouter";
import { Sparkles, Home, Zap, Dumbbell, Shirt, Package, ChevronLeft, ChevronRight } from "lucide-react";

const CATEGORIES = [
  { slug: "beleza", label: "Beleza", description: "Cuidados pessoais e cosméticos", icon: Sparkles, color: "bg-pink-50 text-pink-600 border-pink-100" },
  { slug: "casa", label: "Casa", description: "Utilidades domésticas e decoração", icon: Home, color: "bg-amber-50 text-amber-600 border-amber-100" },
  { slug: "eletronicos", label: "Eletrônicos", description: "Gadgets, acessórios e tecnologia", icon: Zap, color: "bg-blue-50 text-blue-600 border-blue-100" },
  { slug: "esportes", label: "Esportes", description: "Esporte, fitness e ar livre", icon: Dumbbell, color: "bg-green-50 text-green-600 border-green-100" },
  { slug: "moda", label: "Moda", description: "Roupas, calçados e acessórios", icon: Shirt, color: "bg-purple-50 text-purple-600 border-purple-100" },
  { slug: "outros", label: "Outros", description: "Diversos", icon: Package, color: "bg-gray-50 text-gray-600 border-gray-200" },
];

export default function Categorias() {
  const [scrollPos, setScrollPos] = useState(0);

  const scroll = (direction: "left" | "right") => {
    const container = document.getElementById("categories-carousel");
    if (!container) return;
    const scrollAmount = 350;
    const newPos = direction === "left" ? scrollPos - scrollAmount : scrollPos + scrollAmount;
    container.scrollLeft = newPos;
    setScrollPos(newPos);
  };

  return (
    <div className="container py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-red-600 transition-colors">Início</Link>
        <span>/</span>
        <span className="text-gray-800 font-medium">Categorias</span>
      </nav>

      <h1 className="text-2xl font-bold text-gray-900 mb-8">Todas as Categorias</h1>

      {/* Carousel */}
      <div className="relative">
        <div
          id="categories-carousel"
          className="flex gap-4 overflow-x-auto scroll-smooth pb-4"
          style={{ scrollBehavior: "smooth" }}
        >
          {CATEGORIES.map(cat => {
            const Icon = cat.icon;
            return (
              <Link key={cat.slug} href={`/categoria/${cat.slug}`}>
                <div className="flex-shrink-0 w-80 h-40 bg-white border rounded-2xl p-6 flex flex-col items-start gap-4 hover:shadow-lg hover:border-red-300 transition-all duration-200 cursor-pointer">
                  <div className={`p-3 rounded-lg ${cat.color} border`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <h2 className="font-bold text-lg text-gray-900">{cat.label}</h2>
                    <p className="text-sm text-gray-500 mt-1">{cat.description}</p>
                  </div>
                  <div className="text-sm text-red-600 font-medium">Ver produtos →</div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Carousel Controls */}
        <button
          onClick={() => scroll("left")}
          className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 bg-red-600 hover:bg-red-700 text-white p-2 rounded-full transition-colors z-10"
          aria-label="Anterior"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button
          onClick={() => scroll("right")}
          className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 bg-red-600 hover:bg-red-700 text-white p-2 rounded-full transition-colors z-10"
          aria-label="Próximo"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Info Text */}
      <div className="mt-12 p-6 bg-blue-50 border border-blue-100 rounded-xl text-center">
        <p className="text-gray-700">
          Clique em qualquer categoria para explorar todos os produtos disponíveis naquela seção.
        </p>
      </div>
    </div>
  );
}
