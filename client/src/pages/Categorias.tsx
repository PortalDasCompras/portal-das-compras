import { Link } from "wouter";
import { Sparkles, Home, Zap, Dumbbell, Shirt, Package } from "lucide-react";

const CATEGORIES = [
  { slug: "beleza", label: "Beleza", description: "Cuidados pessoais e cosméticos", icon: Sparkles, color: "bg-pink-50 text-pink-600 border-pink-100" },
  { slug: "casa", label: "Casa", description: "Utilidades domésticas e decoração", icon: Home, color: "bg-amber-50 text-amber-600 border-amber-100" },
  { slug: "eletronicos", label: "Eletrônicos", description: "Gadgets, acessórios e tecnologia", icon: Zap, color: "bg-blue-50 text-blue-600 border-blue-100" },
  { slug: "esportes", label: "Esportes", description: "Esporte, fitness e ar livre", icon: Dumbbell, color: "bg-green-50 text-green-600 border-green-100" },
  { slug: "moda", label: "Moda", description: "Roupas, calçados e acessórios", icon: Shirt, color: "bg-purple-50 text-purple-600 border-purple-100" },
  { slug: "outros", label: "Outros", description: "Diversos", icon: Package, color: "bg-gray-50 text-gray-600 border-gray-200" },
];

export default function Categorias() {
  return (
    <div className="container py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-red-600 transition-colors">Início</Link>
        <span>/</span>
        <span className="text-gray-800 font-medium">Categorias</span>
      </nav>

      <h1 className="text-2xl font-bold text-gray-900 mb-6">Categorias</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {CATEGORIES.map(cat => {
          const Icon = cat.icon;
          return (
            <Link key={cat.slug} href={`/categoria/${cat.slug}`}>
              <div className={`border rounded-xl p-6 flex items-start gap-4 hover:shadow-md transition-all duration-200 cursor-pointer bg-white hover:border-red-200`}>
                <div className={`p-3 rounded-lg ${cat.color} border`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-semibold text-gray-900">{cat.label}</h2>
                  <p className="text-sm text-gray-500 mt-0.5">{cat.description}</p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
