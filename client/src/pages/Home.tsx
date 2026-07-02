import { useState } from "react";
import { Search, ChevronLeft, ChevronRight, Sparkles, Home as HomeIcon, Zap, Dumbbell, Shirt, Package } from "lucide-react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import ProductCard from "@/components/ProductCard";

const CATEGORIES = [
  { slug: "beleza", label: "Beleza", icon: Sparkles, color: "bg-pink-50 text-pink-600 border-pink-100" },
  { slug: "casa", label: "Casa", icon: HomeIcon, color: "bg-amber-50 text-amber-600 border-amber-100" },
  { slug: "eletronicos", label: "Eletrônicos", icon: Zap, color: "bg-blue-50 text-blue-600 border-blue-100" },
  { slug: "esportes", label: "Esportes", icon: Dumbbell, color: "bg-green-50 text-green-600 border-green-100" },
  { slug: "moda", label: "Moda", icon: Shirt, color: "bg-purple-50 text-purple-600 border-purple-100" },
  { slug: "outros", label: "Outros", icon: Package, color: "bg-gray-50 text-gray-600 border-gray-200" },
];

const BANNERS = [
  {
    id: 1,
    title: "Desconto em Eletrônicos",
    subtitle: "Até 50% OFF",
    bg: "bg-gradient-to-r from-blue-600 to-blue-400",
  },
  {
    id: 2,
    title: "Moda Sustentável",
    subtitle: "Coleção Nova",
    bg: "bg-gradient-to-r from-purple-600 to-pink-400",
  }
];

export default function Home() {
  const [search, setSearch] = useState("");
  const [scrollPos, setScrollPos] = useState(0);
  const [topSellingScroll, setTopSellingScroll] = useState(0);
  const [categoriesScroll, setCategoriesScroll] = useState(0);

  const { data: products = [] } = trpc.products.list.useQuery(undefined, { refetchOnWindowFocus: false });

  // Ordenar produtos por mais vendidos (simulado por ID)
  const topSellingProducts = products.slice(0, 5);

  const scroll = (direction: "left" | "right", containerId: string, setter: any, current: number) => {
    const container = document.getElementById(containerId);
    if (!container) return;
    const scrollAmount = 300;
    const newPos = direction === "left" ? current - scrollAmount : current + scrollAmount;
    container.scrollLeft = newPos;
    setter(newPos);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="bg-white border-b border-gray-100 py-12 md:py-16">
        <div className="container text-center">
          <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 leading-tight mb-3">
            Achados que valem a pena,<br className="hidden md:block" /> direto no seu endereço.
          </h1>
          <p className="text-gray-500 text-base md:text-lg mb-8">
            Eletrônicos, moda, casa, esportes e beleza — curadoria com preços honestos.
          </p>

          {/* Search */}
          <div className="relative max-w-xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar produtos..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent bg-gray-50"
            />
          </div>
        </div>
      </section>

      <div className="container py-12">
        {/* Top Banner */}
        <div className="mb-12 rounded-2xl overflow-hidden shadow-lg">
          <div className={`${BANNERS[0].bg} h-48 md:h-64 flex items-center justify-center text-center text-white p-6`}>
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-2">{BANNERS[0].title}</h2>
              <p className="text-lg md:text-2xl opacity-90">{BANNERS[0].subtitle}</p>
            </div>
          </div>
        </div>

        {/* Top Selling Products Carousel */}
        {topSellingProducts.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Mais Vendidos</h2>
            
            <div className="relative">
              <div
                id="top-selling-carousel"
                className="flex gap-4 overflow-x-auto scroll-smooth pb-4"
                style={{ scrollBehavior: "smooth" }}
              >
                {topSellingProducts.map(product => (
                  <div key={product.id} className="flex-shrink-0 w-64">
                    <ProductCard id={product.id} name={product.name} price={product.price} originalPrice={product.originalPrice} image={product.image} />
                  </div>
                ))}
              </div>

              {/* Carousel Controls */}
              <button
                onClick={() => scroll("left", "top-selling-carousel", setTopSellingScroll, topSellingScroll)}
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 bg-red-600 hover:bg-red-700 text-white p-2 rounded-full transition-colors z-10"
                aria-label="Anterior"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => scroll("right", "top-selling-carousel", setTopSellingScroll, topSellingScroll)}
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 bg-red-600 hover:bg-red-700 text-white p-2 rounded-full transition-colors z-10"
                aria-label="Próximo"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Middle Banner */}
        <div className="mb-12 rounded-2xl overflow-hidden shadow-lg">
          <div className={`${BANNERS[1].bg} h-48 md:h-64 flex items-center justify-center text-center text-white p-6`}>
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-2">{BANNERS[1].title}</h2>
              <p className="text-lg md:text-2xl opacity-90">{BANNERS[1].subtitle}</p>
            </div>
          </div>
        </div>

        {/* Categories Grid - Smaller Icons */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Explore as Categorias</h2>
          
          <div className="relative">
            <div
              id="categories-carousel"
              className="flex gap-3 overflow-x-auto scroll-smooth pb-4"
              style={{ scrollBehavior: "smooth" }}
            >
              {CATEGORIES.map(cat => {
                const Icon = cat.icon;
                return (
                  <Link key={cat.slug} href={`/categoria/${cat.slug}`}>
                    <div className="flex-shrink-0 w-32 md:w-40 bg-white border rounded-xl p-4 flex flex-col items-center gap-3 hover:shadow-lg hover:border-red-300 transition-all duration-200 cursor-pointer">
                      <div className={`p-2 rounded-lg ${cat.color} border`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="text-center">
                        <h3 className="font-bold text-sm md:text-base text-gray-900">{cat.label}</h3>
                      </div>
                      <div className="text-xs text-red-600 font-medium">Ver →</div>
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* Carousel Controls */}
            <button
              onClick={() => scroll("left", "categories-carousel", setCategoriesScroll, categoriesScroll)}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 bg-red-600 hover:bg-red-700 text-white p-2 rounded-full transition-colors z-10"
              aria-label="Anterior"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => scroll("right", "categories-carousel", setCategoriesScroll, categoriesScroll)}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 bg-red-600 hover:bg-red-700 text-white p-2 rounded-full transition-colors z-10"
              aria-label="Próximo"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
