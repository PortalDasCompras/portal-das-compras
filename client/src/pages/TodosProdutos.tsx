import { useState, useMemo } from "react";
import { Search } from "lucide-react";
import { trpc } from "@/lib/trpc";
import ProductCard from "@/components/ProductCard";

export default function TodosProdutos() {
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "price-asc" | "price-desc">("name");

  const { data: products = [] } = trpc.products.list.useQuery(undefined, { refetchOnWindowFocus: false });

  // Filtrar e ordenar produtos
  const filteredProducts = useMemo(() => {
    let filtered = products.filter(p =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.description?.toLowerCase().includes(search.toLowerCase())
    );

    // Ordenar
    if (sortBy === "price-asc") {
      filtered.sort((a, b) => a.price - b.price);
    } else if (sortBy === "price-desc") {
      filtered.sort((a, b) => b.price - a.price);
    } else {
      filtered.sort((a, b) => a.name.localeCompare(b.name));
    }

    return filtered;
  }, [products, search, sortBy]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <section className="bg-white border-b border-gray-100 py-8 md:py-12">
        <div className="container">
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-6">
            Todos os Produtos
          </h1>

          {/* Search e Filtros */}
          <div className="flex flex-col gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar produtos..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white"
              />
            </div>

            {/* Sort */}
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium text-gray-700">Ordenar por:</label>
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value as any)}
                className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white"
              >
                <option value="name">Nome (A-Z)</option>
                <option value="price-asc">Preço (Menor)</option>
                <option value="price-desc">Preço (Maior)</option>
              </select>
            </div>
          </div>

          {/* Resultado */}
          <p className="text-sm text-gray-600 mt-4">
            Mostrando <span className="font-semibold">{filteredProducts.length}</span> de <span className="font-semibold">{products.length}</span> produtos
          </p>
        </div>
      </section>

      {/* Produtos Grid */}
      <section className="py-12">
        <div className="container">
          {filteredProducts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">Nenhum produto encontrado</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map(product => (
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
          )}
        </div>
      </section>
    </div>
  );
}
