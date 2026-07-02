import { useState, useMemo } from "react";
import { Search } from "lucide-react";
import { trpc } from "@/lib/trpc";
import ProductCard from "@/components/ProductCard";

const CATEGORIES = [
  { slug: "todos", label: "Todos" },
  { slug: "beleza", label: "Beleza" },
  { slug: "casa", label: "Casa" },
  { slug: "eletronicos", label: "Eletrônicos" },
  { slug: "esportes", label: "Esportes" },
  { slug: "moda", label: "Moda" },
  { slug: "outros", label: "Outros" },
];

export default function Home() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("todos");

  const { data: products = [], isLoading } = trpc.products.list.useQuery(
    { category: activeCategory, search: activeCategory === "todos" ? search : undefined },
    { refetchOnWindowFocus: false }
  );

  const filtered = useMemo(() => {
    if (!search || activeCategory !== "todos") return products;
    return products.filter(p =>
      p.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [products, search, activeCategory]);

  return (
    <div className="min-h-screen" style={{ backgroundColor: "oklch(0.97 0.005 80)" }}>
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
              onChange={e => { setSearch(e.target.value); setActiveCategory("todos"); }}
              className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent bg-gray-50"
            />
          </div>
        </div>
      </section>

      {/* Category Filters */}
      <div className="container pt-6">
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map(cat => (
            <button
              key={cat.slug}
              onClick={() => { setActiveCategory(cat.slug); setSearch(""); }}
              className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all duration-150 ${
                activeCategory === cat.slug
                  ? "bg-red-600 text-white border-red-600 shadow-sm"
                  : "bg-white text-gray-600 border-gray-200 hover:border-red-300 hover:text-red-600"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      <div className="container py-6">
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-white rounded-xl overflow-hidden border border-gray-100 animate-pulse">
                <div className="aspect-square bg-gray-200" />
                <div className="p-3 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                  <div className="h-5 bg-gray-200 rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <Search className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-lg font-medium">Nenhum produto encontrado</p>
            <p className="text-sm mt-1">Tente outro termo ou categoria</p>
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-500 mb-4">{filtered.length} produto{filtered.length !== 1 ? "s" : ""}</p>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filtered.map(product => (
                <ProductCard
                  key={product.id}
                  id={product.id}
                  name={product.name}
                  price={product.price}
                  originalPrice={product.originalPrice}
                  image={product.image}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
