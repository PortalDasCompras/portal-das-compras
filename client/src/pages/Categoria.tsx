import { Link, useParams } from "wouter";
import { trpc } from "@/lib/trpc";
import ProductCard from "@/components/ProductCard";

const CATEGORY_LABELS: Record<string, { label: string; description: string }> = {
  beleza: { label: "Beleza", description: "Cuidados pessoais e cosméticos" },
  casa: { label: "Casa", description: "Utilidades domésticas e decoração" },
  eletronicos: { label: "Eletrônicos", description: "Gadgets, acessórios e tecnologia" },
  esportes: { label: "Esportes", description: "Esporte, fitness e ar livre" },
  moda: { label: "Moda", description: "Roupas, calçados e acessórios" },
  outros: { label: "Outros", description: "Diversos" },
};

export default function Categoria() {
  const { slug } = useParams<{ slug: string }>();
  const meta = CATEGORY_LABELS[slug] ?? { label: slug, description: "" };

  const { data: products = [], isLoading } = trpc.products.list.useQuery(
    { category: slug },
    { refetchOnWindowFocus: false }
  );

  return (
    <div className="container py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-red-600 transition-colors">Início</Link>
        <span>/</span>
        <Link href="/categorias" className="hover:text-red-600 transition-colors">Categorias</Link>
        <span>/</span>
        <span className="text-gray-800 font-medium">{meta.label}</span>
      </nav>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{meta.label}</h1>
        {meta.description && <p className="text-gray-500 mt-1">{meta.description}</p>}
      </div>

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
      ) : products.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-lg font-medium">Nenhum produto nesta categoria</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map(product => (
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
  );
}
