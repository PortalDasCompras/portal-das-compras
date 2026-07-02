import { Link } from "wouter";
import { Heart, ShoppingBag } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useWishlist } from "@/contexts/WishlistContext";
import { useCart } from "@/contexts/CartContext";
import ProductCard from "@/components/ProductCard";
import { toast } from "sonner";

export default function Favoritos() {
  const { favorites } = useWishlist();
  const { addItem } = useCart();

  const { data: products = [], isLoading } = trpc.products.list.useQuery(
    {},
    { refetchOnWindowFocus: false }
  );

  const favoriteProducts = products.filter(p => favorites.includes(p.id));

  const handleAddAllToCart = () => {
    if (favoriteProducts.length === 0) return;
    favoriteProducts.forEach(product => {
      addItem({
        productId: product.id,
        name: product.name,
        price: parseFloat(String(product.price)),
        image: product.image,
      });
    });
    toast.success(`${favoriteProducts.length} produto${favoriteProducts.length !== 1 ? "s" : ""} adicionado${favoriteProducts.length !== 1 ? "s" : ""} ao carrinho!`);
  };

  if (isLoading) {
    return (
      <div className="container py-8">
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
      </div>
    );
  }

  return (
    <div className="container py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-red-600 transition-colors">Início</Link>
        <span>/</span>
        <span className="text-gray-800 font-medium">Favoritos</span>
      </nav>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Meus Favoritos</h1>
          <p className="text-gray-500 mt-1">
            {favoriteProducts.length} produto{favoriteProducts.length !== 1 ? "s" : ""} salvo{favoriteProducts.length !== 1 ? "s" : ""}
          </p>
        </div>
        {favoriteProducts.length > 0 && (
          <button
            onClick={handleAddAllToCart}
            className="bg-red-600 hover:bg-red-700 text-white font-semibold px-4 py-2.5 rounded-lg transition-colors flex items-center gap-2"
          >
            <ShoppingBag className="w-4 h-4" />
            Adicionar todos ao carrinho
          </button>
        )}
      </div>

      {favoriteProducts.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <Heart className="w-16 h-16 mx-auto mb-4 opacity-20" />
          <p className="text-lg font-medium text-gray-600">Nenhum favorito ainda</p>
          <p className="text-sm text-gray-500 mt-1">Clique no coração dos produtos para salvá-los aqui</p>
          <Link href="/">
            <button className="mt-6 bg-red-600 hover:bg-red-700 text-white font-semibold px-6 py-2.5 rounded-lg transition-colors">
              Explorar produtos
            </button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {favoriteProducts.map(product => (
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
