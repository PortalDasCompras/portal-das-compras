import { useState, useEffect } from "react";
import { Link, useParams, useLocation } from "wouter";
import { ChevronDown, ChevronUp, Star, Volume2, VolumeX, ShoppingCart, CheckCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";

const CATEGORY_LABELS: Record<string, string> = {
  beleza: "Beleza", casa: "Casa", eletronicos: "Eletrônicos",
  esportes: "Esportes", moda: "Moda", outros: "Outros",
};

const FAQ_ITEMS = [
  { q: "Qual o prazo de entrega?", a: "O prazo médio de entrega é de 1 a 3 dias úteis após a confirmação do pagamento, com envio para todo o Brasil." },
  { q: "O produto tem garantia?", a: "Sim, todos os produtos possuem garantia mínima de 90 dias contra defeitos de fabricação." },
  { q: "Como funciona o pagamento?", a: "Aceitamos PIX, boleto bancário e cartão de crédito em até 12x sem juros." },
  { q: "Posso trocar ou devolver?", a: "Sim, você tem até 7 dias após o recebimento para solicitar troca ou devolução sem custo adicional." },
  { q: "Como acompanho meu pedido?", a: "Após a confirmação do pagamento, você receberá um código de rastreio por e-mail para acompanhar a entrega." },
];

const ALL_REVIEWS = [
  { initials: "AP", name: "Ana Paula S.", city: "São Paulo - SP", time: "há 3 dias", text: "Chegou super rápido, muito melhor do que eu esperava! Recomendo demais, produto de qualidade e o atendimento foi excelente.", rating: 5 },
  { initials: "JM", name: "Juliana M.", city: "Belo Horizonte - MG", time: "há 2 semanas", text: "Muito bom pelo preço que paguei. Entrega demorou uns dias a mais, mas o produto compensou totalmente.", rating: 5 },
  { initials: "BK", name: "Beatriz K.", city: "João Pessoa - PB", time: "há 12 dias", text: "Excelente compra! Meu marido também gostou e vamos comprar outro para o trabalho dele.", rating: 5 },
  { initials: "FC", name: "Fernanda C.", city: "Porto Alegre - RS", time: "há 6 dias", text: "Amei! Comprei achando que era só mais um, mas surpreendeu. Vale cada centavo, gente.", rating: 5 },
  { initials: "AL", name: "Amanda L.", city: "Natal - RN", time: "há 6 dias", text: "Não esperava que seria tão bom pelo valor! Fiquei impressionada com a qualidade. Recomendo demais!", rating: 5 },
  { initials: "MV", name: "Marcos V.", city: "Fortaleza - CE", time: "há 5 dias", text: "Cara, funcionou perfeitamente! Bateria dura mesmo o tempo que promete. Recomendo para todo mundo.", rating: 5 },
  { initials: "EP", name: "Eduardo P.", city: "Campinas - SP", time: "há 1 semana", text: "Comprei achando que iria demorar mas em 6 dias já estava aqui. Produto excelente, atendeu completamente.", rating: 5 },
  { initials: "PO", name: "Priscila O.", city: "Niterói - RJ", time: "há 4 dias", text: "Melhor site pra comprar! Sempre chega direitinho e o suporte responde super rápido no WhatsApp.", rating: 5 },
  { initials: "CB", name: "Carlos B.", city: "Salvador - BA", time: "há 8 dias", text: "Superou minhas expectativas! Entrega rápida e produto de excelente qualidade. Voltaria a comprar com certeza!", rating: 5 },
  { initials: "LR", name: "Larissa R.", city: "Curitiba - PR", time: "há 10 dias", text: "Adorei! Chegou bem embalado e o atendimento foi muito atencioso. Recomendo para todos os meus amigos!", rating: 5 },
  { initials: "RM", name: "Roberto M.", city: "Brasília - DF", time: "há 1 dia", text: "Produto de qualidade premium. Vale cada centavo investido. Já é minha segunda compra aqui.", rating: 5 },
  { initials: "SG", name: "Sophia G.", city: "Manaus - AM", time: "há 5 dias", text: "Entrega mais rápida do que esperava! Produto excelente, muito satisfeita com a compra.", rating: 5 },
  { initials: "DT", name: "Diego T.", city: "Recife - PE", time: "há 9 dias", text: "Melhor custo-benefício que já vi! Produto chegou em perfeito estado e funciona maravilhosamente.", rating: 5 },
  { initials: "NP", name: "Natália P.", city: "Porto Alegre - RS", time: "há 4 dias", text: "Comprei para presentear e a pessoa adorou! Voltarei a comprar com certeza.", rating: 5 },
  { initials: "VH", name: "Victor H.", city: "Goiânia - GO", time: "há 7 dias", text: "Qualidade impecável! Atendimento excelente e entrega dentro do prazo. Recomendo muito!", rating: 5 },
  { initials: "FS", name: "Fernanda S.", city: "Belém - PA", time: "há 2 dias", text: "Adorei a experiência de compra! Produto chegou bem protegido e em perfeito estado.", rating: 5 },
];

// Função para variar quantidade de avaliações por produto (33 quantidades diferentes)
function getReviewsForProduct(productId: number): typeof ALL_REVIEWS {
  // 33 quantidades diferentes para cada um dos 33 produtos
  const quantities = [8, 12, 10, 14, 9, 11, 13, 15, 7, 16, 6, 5, 11, 12, 8, 9, 13, 14, 10, 15, 7, 16, 11, 12, 9, 10, 14, 8, 13, 15, 6, 11, 12];
  const index = (productId - 1) % quantities.length;
  const quantity = quantities[Math.min(index, quantities.length - 1)];
  return ALL_REVIEWS.slice(0, Math.min(quantity, ALL_REVIEWS.length));
}

export default function Produto() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const { addItem } = useCart();
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [muted, setMuted] = useState(false);
  const [added, setAdded] = useState(false);
  const [reviewIndex, setReviewIndex] = useState(0);
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [autoPlayReviews, setAutoPlayReviews] = useState(true);

  const productId = parseInt(id);
  const REVIEWS = getReviewsForProduct(productId);

  // Auto-scroll das avaliações com loop infinito
  useEffect(() => {
    if (!autoPlayReviews) return;
    const interval = setInterval(() => {
      setReviewIndex((prev) => (prev + 1) % REVIEWS.length);
    }, 2000); // Muda a cada 2 segundos
    return () => clearInterval(interval);
  }, [autoPlayReviews, REVIEWS.length]);

  const { data: product, isLoading } = trpc.products.getById.useQuery(
    { id: parseInt(id) },
    { refetchOnWindowFocus: false, retry: false }
  );

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="grid md:grid-cols-2 gap-8 animate-pulse">
          <div className="aspect-square bg-gray-200 rounded-xl" />
          <div className="space-y-4">
            <div className="h-8 bg-gray-200 rounded w-3/4" />
            <div className="h-6 bg-gray-200 rounded w-1/2" />
            <div className="h-12 bg-gray-200 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container py-16 text-center">
        <p className="text-gray-500 text-lg">Produto não encontrado.</p>
        <Link href="/" className="text-red-600 hover:underline mt-2 inline-block">Voltar à loja</Link>
      </div>
    );
  }

  const priceNum = parseFloat(String(product.price));
  const originalNum = parseFloat(String(product.originalPrice));
  const savings = originalNum - priceNum;
  const categoryLabel = CATEGORY_LABELS[product.category] ?? product.category;

  const nextReview = () => {
    setReviewIndex((prev) => (prev + 1) % REVIEWS.length);
  };

  const prevReview = () => {
    setReviewIndex((prev) => (prev - 1 + REVIEWS.length) % REVIEWS.length);
  };

  const visibleReviews = [REVIEWS[reviewIndex]];

  const handleBuy = () => {
    addItem({
      productId: product.id,
      name: product.name,
      price: priceNum,
      image: product.image,
    });
    setAdded(true);
    toast.success("Produto adicionado ao carrinho!");
    setTimeout(() => navigate("/carrinho"), 800);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container py-6">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <Link href="/" className="hover:text-red-600 transition-colors">Início</Link>
          <span>/</span>
          <Link href={`/categoria/${product.category}`} className="hover:text-red-600 transition-colors">{categoryLabel}</Link>
        </nav>

        {/* Product Main */}
        <div className="grid md:grid-cols-2 gap-8 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          {/* Image */}
          <div className="aspect-square rounded-xl overflow-hidden bg-gray-50">
            <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
          </div>

          {/* Info */}
          <div className="flex flex-col gap-4">
            <h1 className="text-2xl font-bold text-gray-900 leading-snug">{product.name}</h1>

            <div className="flex flex-col gap-1">
              <span className="text-sm text-gray-400 line-through">De R$ {originalNum.toFixed(2).replace(".", ",")}</span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-gray-900">
                  R$ {priceNum.toFixed(2).replace(".", ",")}
                </span>
                <span className="text-sm text-gray-500">à vista</span>
              </div>
              <span className="inline-flex items-center gap-1 text-sm font-semibold text-green-700 bg-green-50 px-2 py-0.5 rounded-full w-fit">
                Economize R$ {savings.toFixed(2).replace(".", ",")}
              </span>
            </div>

            <div className="flex items-center gap-2 text-sm text-green-600">
              <CheckCircle className="w-4 h-4" />
              <span>Em estoque ({product.stock} disponíveis)</span>
            </div>

            <button
              onClick={handleBuy}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded-xl text-base transition-all duration-150 active:scale-[0.97] shadow-md hover:shadow-lg flex items-center justify-center gap-2"
            >
              <ShoppingCart className="w-5 h-5" />
              Comprar agora
            </button>

            {/* Video */}
            <div className="relative bg-black rounded-xl overflow-hidden w-full">
              <video
                className="w-full h-auto object-contain"
                autoPlay
                loop
                muted={muted}
                playsInline
                preload="metadata"
                poster="https://portaldascompra.lovable.app/__l5e/assets-v1/095cedc1-f0ac-495f-b1d2-193c8179ce3f/ugc-product.mp4?t=0"
                onLoadStart={() => console.log('Vídeo carregando...')}
              >
                <source src="https://portaldascompra.lovable.app/__l5e/assets-v1/095cedc1-f0ac-495f-b1d2-193c8179ce3f/ugc-product.mp4" type="video/mp4" />
                Seu navegador não suporta vídeos HTML5.
              </video>
              {muted && (
                <button
                  onClick={() => setMuted(false)}
                  className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/30 transition-colors group"
                  aria-label="Ativar som"
                >
                  <div className="bg-white/90 group-hover:bg-white text-red-600 p-4 rounded-full transition-all transform group-hover:scale-110">
                    <VolumeX className="w-8 h-8" />
                  </div>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Description */}
        {product.description && (
          <div className="bg-white rounded-2xl p-6 mt-6 shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold text-gray-900 mb-3">Descrição</h2>
            <p className="text-gray-600 leading-relaxed">{product.description}</p>
          </div>
        )}

        {/* Reviews Carousel */}
        <div className="mt-8">
          <div className="flex items-center gap-3 mb-6">
            <h2 className="text-lg font-bold text-gray-900">Avaliações de clientes</h2>
            <div className="flex items-center gap-1">
              <span className="font-bold text-gray-900">4.8</span>
              <div className="flex">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <span className="text-sm text-gray-500">({REVIEWS.length} avaliações)</span>
            </div>
          </div>

          <div className="overflow-hidden">
            <div className="flex gap-4 transition-transform duration-500" style={{ transform: `translateX(-${reviewIndex * 100}%)` }}>
              {REVIEWS.map((review, i) => (
                <div key={i} className="flex-shrink-0 w-full md:w-1/2 bg-white rounded-xl p-5 border border-gray-100">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-red-100 text-red-700 font-bold text-sm flex items-center justify-center flex-shrink-0">
                      {review.initials}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-800">{review.name}</p>
                      <p className="text-xs text-gray-400">{review.city} · {review.time}</p>
                    </div>
                    <div className="flex">
                      {Array.from({ length: review.rating }).map((_, j) => (
                        <Star key={j} className="w-3 h-3 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed">{review.text}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Carousel Indicators */}
          <div className="flex justify-center gap-2 mt-6">
            {REVIEWS.map((_, i) => (
              <button
                key={i}
                onClick={() => setReviewIndex(i)}
                className={`h-2 rounded-full transition-all ${
                  i === reviewIndex ? "bg-red-600 w-6" : "bg-gray-300 w-2"
                }`}
                aria-label={`Ir para avaliação ${i + 1}`}
              />
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div className="bg-white rounded-2xl p-6 mt-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Perguntas frequentes</h2>
          <div className="divide-y divide-gray-100">
            {FAQ_ITEMS.map((item, i) => (
              <div key={i}>
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between py-4 text-left text-sm font-medium text-gray-800 hover:text-red-600 transition-colors"
                >
                  <span>{item.q}</span>
                  {openFaq === i ? <ChevronUp className="w-4 h-4 flex-shrink-0" /> : <ChevronDown className="w-4 h-4 flex-shrink-0" />}
                </button>
                {openFaq === i && (
                  <p className="pb-4 text-sm text-gray-500 leading-relaxed">{item.a}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
