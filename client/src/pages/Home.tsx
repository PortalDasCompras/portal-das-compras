import { useState, useMemo } from "react";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import ProductCard from "@/components/ProductCard";

const CATEGORIES = [
  { slug: "beleza", label: "Beleza" },
  { slug: "casa", label: "Casa" },
  { slug: "eletronicos", label: "Eletrônicos" },
  { slug: "esportes", label: "Esportes" },
  { slug: "moda", label: "Moda" },
  { slug: "outros", label: "Outros" },
];

const BANNERS = [
  {
    id: 1,
    title: "Desconto em Eletrônicos",
    subtitle: "Até 50% OFF",
    bg: "bg-gradient-to-r from-blue-600 to-blue-400",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1200&h=300&fit=crop"
  },
  {
    id: 2,
    title: "Moda Sustentável",
    subtitle: "Coleção Nova",
    bg: "bg-gradient-to-r from-purple-600 to-pink-400",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&h=300&fit=crop"
  }
];

function CarouselSection({ title, products, categorySlug }: { title: string; products: any[]; categorySlug: string }) {
  const [scrollPos, setScrollPos] = useState(0);

  const scroll = (direction: "left" | "right") => {
    const container = document.getElementById(`carousel-${categorySlug}`);
    if (!container) return;
    const scrollAmount = 300;
    const newPos = direction === "left" ? scrollPos - scrollAmount : scrollPos + scrollAmount;
    container.scrollLeft = newPos;
    setScrollPos(newPos);
  };

  return (
    <div className="mb-12">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900">{title}</h2>
        <Link href={`/categoria/${categorySlug}`} className="text-sm text-red-600 hover:text-red-700 font-medium">
          Ver todos →
        </Link>
      </div>
      <div className="relative">
        <div
          id={`carousel-${categorySlug}`}
          className="flex gap-4 overflow-x-auto scroll-smooth pb-2"
          style={{ scrollBehavior: "smooth" }}
        >
          {products.slice(0, 5).map(product => (
            <div key={product.id} className="flex-shrink-0 w-48">
              <ProductCard
                id={product.id}
                name={product.name}
                price={product.price}
                originalPrice={product.originalPrice}
                image={product.image}
              />
            </div>
          ))}
        </div>
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
    </div>
  );
}

export default function Home() {
  const [search, setSearch] = useState("");

  const { data: allProducts = [] } = trpc.products.list.useQuery(
    { category: "todos" },
    { refetchOnWindowFocus: false }
  );

  // Agrupar produtos por categoria
  const productsByCategory = useMemo(() => {
    const grouped: Record<string, any[]> = {};
    CATEGORIES.forEach(cat => {
      grouped[cat.slug] = allProducts.filter(p => p.category === cat.slug);
    });
    return grouped;
  }, [allProducts]);

  // Mais vendidos (primeiros 5)
  const topSelling = allProducts.slice(0, 5);

  const handleSearch = (value: string) => {
    setSearch(value);
    // Aqui você poderia adicionar lógica de busca se necessário
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
              onChange={e => handleSearch(e.target.value)}
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

        {/* Mais Vendidos Carousel */}
        {topSelling.length > 0 && (
          <CarouselSection title="🔥 Mais Vendidos" products={topSelling} categorySlug="top" />
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

        {/* Categories with Carousels */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Todas as Categorias</h2>
          {CATEGORIES.map(category => (
            productsByCategory[category.slug]?.length > 0 && (
              <CarouselSection
                key={category.slug}
                title={category.label}
                products={productsByCategory[category.slug]}
                categorySlug={category.slug}
              />
            )
          ))}
        </div>
      </div>
    </div>
  );
}
