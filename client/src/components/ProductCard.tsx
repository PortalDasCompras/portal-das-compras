import { Link } from "wouter";

interface ProductCardProps {
  id: number;
  name: string;
  price: string | number;
  originalPrice: string | number;
  image: string;
}

export default function ProductCard({ id, name, price, originalPrice, image }: ProductCardProps) {
  const priceNum = parseFloat(String(price));
  const originalNum = parseFloat(String(originalPrice));
  const savings = originalNum - priceNum;

  return (
    <Link href={`/produto/${id}`} className="block">
      <div className="product-card bg-white rounded-xl overflow-hidden border border-gray-100 cursor-pointer">
        <div className="aspect-square overflow-hidden bg-gray-50">
          <img
            src={image}
            alt={name}
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
            loading="lazy"
          />
        </div>
        <div className="p-3">
          <h3 className="text-sm font-medium text-gray-800 line-clamp-2 mb-2 leading-snug">{name}</h3>
          <div className="flex flex-col gap-0.5">
            <span className="text-xs text-gray-400 line-through">
              R$ {originalNum.toFixed(2).replace(".", ",")}
            </span>
            <span className="text-base font-bold text-gray-900">
              R$ {priceNum.toFixed(2).replace(".", ",")}
            </span>
            <span className="text-xs text-green-600 font-medium">
              Economize R$ {savings.toFixed(2).replace(".", ",")}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
