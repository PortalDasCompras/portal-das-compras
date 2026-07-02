import { useState, useCallback } from "react";
import { Link, useLocation } from "wouter";
import { MapPin, User, CreditCard, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface AddressData {
  logradouro: string;
  bairro: string;
  localidade: string;
  uf: string;
  erro?: boolean;
}

function formatCEP(value: string) {
  return value.replace(/\D/g, "").slice(0, 8).replace(/(\d{5})(\d)/, "$1-$2");
}
function formatCPF(value: string) {
  return value.replace(/\D/g, "").slice(0, 11)
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}
function formatPhone(value: string) {
  return value.replace(/\D/g, "").slice(0, 11)
    .replace(/(\d{2})(\d)/, "($1) $2")
    .replace(/(\d{5})(\d)/, "$1-$2");
}

export default function Checkout() {
  const { items, totalPrice, clearCart } = useCart();
  const [, navigate] = useLocation();

  const [form, setForm] = useState({
    customerName: "", customerEmail: "", customerPhone: "", customerCpf: "",
    addressCep: "", addressStreet: "", addressNumber: "", addressComplement: "",
    addressNeighborhood: "", addressCity: "", addressState: "", paymentMethod: "pix",
  });
  const [cardData, setCardData] = useState({
    cardNumber: "", cardholderName: "", expirationMonth: "", expirationYear: "", securityCode: "",
  });
  const [cepLoading, setCepLoading] = useState(false);
  const [cepError, setCepError] = useState("");
  const [cepSuccess, setCepSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [cardErrors, setCardErrors] = useState<Record<string, string>>({});

  const createOrder = trpc.orders.create.useMutation();
  const processPaymentMutation = trpc.orders.processPayment.useMutation();

  const shipping = totalPrice >= 150 ? 0 : 19.90;
  const total = totalPrice + shipping;

  const fetchCEP = useCallback(async (cep: string) => {
    const clean = cep.replace(/\D/g, "");
    if (clean.length !== 8) return;

    setCepLoading(true);
    setCepError("");
    setCepSuccess(false);

    try {
      const res = await fetch(`https://viacep.com.br/ws/${clean}/json/`);
      const data: AddressData = await res.json();

      if (data.erro) {
        setCepError("CEP não encontrado. Verifique e tente novamente.");
        setForm(prev => ({ ...prev, addressStreet: "", addressNeighborhood: "", addressCity: "", addressState: "" }));
      } else {
        setForm(prev => ({
          ...prev,
          addressStreet: data.logradouro || "",
          addressNeighborhood: data.bairro || "",
          addressCity: data.localidade || "",
          addressState: data.uf || "",
        }));
        setCepSuccess(true);
        setErrors(prev => ({ ...prev, addressCep: "" }));
      }
    } catch {
      setCepError("Erro ao buscar CEP. Verifique sua conexão.");
    } finally {
      setCepLoading(false);
    }
  }, []);

  const handleChange = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: "" }));
  };

  const validateCard = () => {
    const errors: Record<string, string> = {};
    if (!cardData.cardNumber.replace(/\s/g, "").match(/^\d{13,19}$/)) errors.cardNumber = "Número inválido";
    if (!cardData.cardholderName.trim()) errors.cardholderName = "Nome obrigatório";
    if (!cardData.expirationMonth || !cardData.expirationYear) errors.expiration = "Validade obrigatória";
    if (!cardData.securityCode.match(/^\d{3,4}$/)) errors.securityCode = "CVV inválido";
    setCardErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!form.customerName.trim()) newErrors.customerName = "Nome obrigatório";
    if (!form.customerEmail.includes("@")) newErrors.customerEmail = "E-mail inválido";
    if (form.customerPhone.replace(/\D/g, "").length < 10) newErrors.customerPhone = "Telefone inválido";
    if (form.customerCpf.replace(/\D/g, "").length < 11) newErrors.customerCpf = "CPF inválido";
    if (form.addressCep.replace(/\D/g, "").length !== 8) newErrors.addressCep = "CEP inválido";
    if (!form.addressStreet.trim()) newErrors.addressStreet = "Rua obrigatória";
    if (!form.addressNumber.trim()) newErrors.addressNumber = "Número obrigatório";
    if (!form.addressNeighborhood.trim()) newErrors.addressNeighborhood = "Bairro obrigatório";
    if (!form.addressCity.trim()) newErrors.addressCity = "Cidade obrigatória";
    if (!form.addressState.trim()) newErrors.addressState = "Estado obrigatório";
    if (form.paymentMethod === "credit_card" && !validateCard()) return false;
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      toast.error("Preencha todos os campos obrigatórios.");
      return;
    }

    try {
      const orderResult = await createOrder.mutateAsync({
        customerName: form.customerName,
        customerEmail: form.customerEmail,
        customerPhone: form.customerPhone.replace(/\D/g, ""),
        customerCpf: form.customerCpf.replace(/\D/g, ""),
        addressCep: form.addressCep.replace(/\D/g, ""),
        addressStreet: form.addressStreet,
        addressNumber: form.addressNumber,
        addressComplement: form.addressComplement || undefined,
        addressNeighborhood: form.addressNeighborhood,
        addressCity: form.addressCity,
        addressState: form.addressState,
        items: items.map(i => ({ productId: i.productId, name: i.name, price: i.price, quantity: i.quantity, image: i.image })),
        total,
        paymentMethod: form.paymentMethod,
      });

      const paymentResult = await processPaymentMutation.mutateAsync({
        orderId: orderResult.orderId,
        customerName: form.customerName,
        customerEmail: form.customerEmail,
        customerPhone: form.customerPhone.replace(/\D/g, ""),
        customerCpf: form.customerCpf.replace(/\D/g, ""),
        amount: total,
        paymentMethod: form.paymentMethod as "pix" | "boleto" | "credit_card",
        cardData: form.paymentMethod === "cartao" ? {
          cardNumber: cardData.cardNumber,
          cardholderName: cardData.cardholderName,
          expirationMonth: parseInt(cardData.expirationMonth) || 0,
          expirationYear: parseInt(cardData.expirationYear) || 0,
          securityCode: cardData.securityCode,
        } : undefined,
      });

      if (paymentResult.success) {
        clearCart();
        toast.success("Pagamento processado com sucesso!");
        navigate("/pedido-confirmado");
      } else {
        toast.error(paymentResult.error || "Erro ao processar pagamento");
      }
    } catch (err) {
      console.error("Erro ao finalizar pedido:", err);
      toast.error("Erro ao finalizar pedido. Tente novamente.");
    }
  };

  if (items.length === 0) {
    return (
      <div className="container py-16 text-center">
        <p className="text-gray-500 text-lg mb-4">Seu carrinho está vazio.</p>
        <Link href="/" className="text-red-600 hover:underline">Ver produtos</Link>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Finalizar compra</h1>

      <form onSubmit={handleSubmit}>
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Form */}
          <div className="lg:col-span-2 space-y-5">
            {/* Personal Data */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <User className="w-5 h-5 text-red-600" />
                <h2 className="font-bold text-gray-900">Dados pessoais</h2>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nome completo *</label>
                  <input
                    type="text"
                    value={form.customerName}
                    onChange={e => handleChange("customerName", e.target.value)}
                    placeholder="Seu nome completo"
                    className={`w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 ${errors.customerName ? "border-red-400" : "border-gray-200"}`}
                  />
                  {errors.customerName && <p className="text-xs text-red-500 mt-1">{errors.customerName}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">E-mail *</label>
                  <input
                    type="email"
                    value={form.customerEmail}
                    onChange={e => handleChange("customerEmail", e.target.value)}
                    placeholder="seu@email.com"
                    className={`w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 ${errors.customerEmail ? "border-red-400" : "border-gray-200"}`}
                  />
                  {errors.customerEmail && <p className="text-xs text-red-500 mt-1">{errors.customerEmail}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Telefone *</label>
                  <input
                    type="tel"
                    value={form.customerPhone}
                    onChange={e => handleChange("customerPhone", formatPhone(e.target.value))}
                    placeholder="(00) 00000-0000"
                    className={`w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 ${errors.customerPhone ? "border-red-400" : "border-gray-200"}`}
                  />
                  {errors.customerPhone && <p className="text-xs text-red-500 mt-1">{errors.customerPhone}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">CPF *</label>
                  <input
                    type="text"
                    value={form.customerCpf}
                    onChange={e => handleChange("customerCpf", formatCPF(e.target.value))}
                    placeholder="000.000.000-00"
                    className={`w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 ${errors.customerCpf ? "border-red-400" : "border-gray-200"}`}
                  />
                  {errors.customerCpf && <p className="text-xs text-red-500 mt-1">{errors.customerCpf}</p>}
                </div>
              </div>
            </div>

            {/* Address */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="w-5 h-5 text-red-600" />
                <h2 className="font-bold text-gray-900">Endereço de entrega</h2>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                {/* CEP */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">CEP *</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={form.addressCep}
                      onChange={e => {
                        const formatted = formatCEP(e.target.value);
                        handleChange("addressCep", formatted);
                        setCepSuccess(false);
                        setCepError("");
                        if (formatted.replace(/\D/g, "").length === 8) {
                          fetchCEP(formatted);
                        }
                      }}
                      placeholder="00000-000"
                      maxLength={9}
                      className={`w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 pr-10 ${errors.addressCep ? "border-red-400" : cepSuccess ? "border-green-400" : "border-gray-200"}`}
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      {cepLoading && <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />}
                      {cepSuccess && !cepLoading && <CheckCircle className="w-4 h-4 text-green-500" />}
                      {cepError && !cepLoading && <AlertCircle className="w-4 h-4 text-red-500" />}
                    </div>
                  </div>
                  {errors.addressCep && <p className="text-xs text-red-500 mt-1">{errors.addressCep}</p>}
                  {cepError && <p className="text-xs text-red-500 mt-1">{cepError}</p>}
                  {cepSuccess && <p className="text-xs text-green-600 mt-1">CEP encontrado! Endereço preenchido automaticamente.</p>}
                </div>

                {/* Street */}
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Rua / Logradouro *</label>
                  <input
                    type="text"
                    value={form.addressStreet}
                    onChange={e => handleChange("addressStreet", e.target.value)}
                    placeholder="Preenchido automaticamente pelo CEP"
                    className={`w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 ${errors.addressStreet ? "border-red-400" : "border-gray-200"} ${cepSuccess ? "bg-green-50" : ""}`}
                  />
                  {errors.addressStreet && <p className="text-xs text-red-500 mt-1">{errors.addressStreet}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Número *</label>
                  <input
                    type="text"
                    value={form.addressNumber}
                    onChange={e => handleChange("addressNumber", e.target.value)}
                    placeholder="Ex: 123"
                    className={`w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 ${errors.addressNumber ? "border-red-400" : "border-gray-200"}`}
                  />
                  {errors.addressNumber && <p className="text-xs text-red-500 mt-1">{errors.addressNumber}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Complemento</label>
                  <input
                    type="text"
                    value={form.addressComplement}
                    onChange={e => handleChange("addressComplement", e.target.value)}
                    placeholder="Apto, bloco, etc."
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bairro *</label>
                  <input
                    type="text"
                    value={form.addressNeighborhood}
                    onChange={e => handleChange("addressNeighborhood", e.target.value)}
                    placeholder="Preenchido pelo CEP"
                    className={`w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 ${errors.addressNeighborhood ? "border-red-400" : "border-gray-200"} ${cepSuccess ? "bg-green-50" : ""}`}
                  />
                  {errors.addressNeighborhood && <p className="text-xs text-red-500 mt-1">{errors.addressNeighborhood}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cidade *</label>
                  <input
                    type="text"
                    value={form.addressCity}
                    onChange={e => handleChange("addressCity", e.target.value)}
                    placeholder="Preenchido pelo CEP"
                    className={`w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 ${errors.addressCity ? "border-red-400" : "border-gray-200"} ${cepSuccess ? "bg-green-50" : ""}`}
                  />
                  {errors.addressCity && <p className="text-xs text-red-500 mt-1">{errors.addressCity}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Estado *</label>
                  <input
                    type="text"
                    value={form.addressState}
                    onChange={e => handleChange("addressState", e.target.value.toUpperCase().slice(0, 2))}
                    placeholder="UF"
                    maxLength={2}
                    className={`w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 ${errors.addressState ? "border-red-400" : "border-gray-200"} ${cepSuccess ? "bg-green-50" : ""}`}
                  />
                  {errors.addressState && <p className="text-xs text-red-500 mt-1">{errors.addressState}</p>}
                </div>
              </div>
            </div>

            {/* Payment */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <CreditCard className="w-5 h-5 text-red-600" />
                <h2 className="font-bold text-gray-900">Forma de pagamento</h2>
              </div>
              <div className="grid sm:grid-cols-3 gap-3">
                {[
                  { value: "pix", label: "PIX", desc: "Aprovação imediata" },
                  { value: "boleto", label: "Boleto", desc: "Vence em 3 dias" },
                  { value: "cartao", label: "Cartão", desc: "Até 12x sem juros" },
                ].map(opt => (
                  <label
                    key={opt.value}
                    className={`flex flex-col gap-0.5 p-3 border rounded-xl cursor-pointer transition-all ${
                      form.paymentMethod === opt.value
                        ? "border-red-500 bg-red-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={opt.value}
                      checked={form.paymentMethod === opt.value}
                      onChange={() => handleChange("paymentMethod", opt.value)}
                      className="sr-only"
                    />
                    <span className="font-semibold text-sm text-gray-800">{opt.label}</span>
                    <span className="text-xs text-gray-500">{opt.desc}</span>
                  </label>
                ))}
              </div>
              
              {/* Formulário de Cartão */}
              {form.paymentMethod === "cartao" && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <h3 className="font-semibold text-gray-900 mb-3">Dados do cartão</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Número do cartão *</label>
                      <input
                        type="text"
                        value={cardData.cardNumber}
                        onChange={e => setCardData(prev => ({ ...prev, cardNumber: e.target.value.replace(/\D/g, "").slice(0, 19) }))}
                        placeholder="1234 5678 9012 3456"
                        maxLength={19}
                        className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 ${cardErrors.cardNumber ? "border-red-400" : "border-gray-200"}`}
                      />
                      {cardErrors.cardNumber && <p className="text-xs text-red-500 mt-1">{cardErrors.cardNumber}</p>}
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Validade *</label>
                        <input
                          type="text"
                          value={`${cardData.expirationMonth}/${cardData.expirationYear}`}
                          onChange={e => {
                            const val = e.target.value.replace(/\D/g, "").slice(0, 4);
                            if (val.length >= 2) {
                              setCardData(prev => ({ ...prev, expirationMonth: val.slice(0, 2), expirationYear: val.slice(2) }));
                            }
                          }}
                          placeholder="MM/YY"
                          maxLength={5}
                          className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 ${cardErrors.expiration ? "border-red-400" : "border-gray-200"}`}
                        />
                        {cardErrors.expiration && <p className="text-xs text-red-500 mt-1">{cardErrors.expiration}</p>}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">CVV *</label>
                        <input
                          type="text"
                          value={cardData.securityCode}
                          onChange={e => setCardData(prev => ({ ...prev, securityCode: e.target.value.replace(/\D/g, "").slice(0, 4) }))}
                          placeholder="123"
                          maxLength={4}
                          className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 ${cardErrors.securityCode ? "border-red-400" : "border-gray-200"}`}
                        />
                        {cardErrors.securityCode && <p className="text-xs text-red-500 mt-1">{cardErrors.securityCode}</p>}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nome do titular *</label>
                      <input
                        type="text"
                        value={cardData.cardholderName}
                        onChange={e => setCardData(prev => ({ ...prev, cardholderName: e.target.value.toUpperCase() }))}
                        placeholder="NOME SOBRENOME"
                        className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 ${cardErrors.cardholderName ? "border-red-400" : "border-gray-200"}`}
                      />
                      {cardErrors.cardholderName && <p className="text-xs text-red-500 mt-1">{cardErrors.cardholderName}</p>}
                    </div>
                  </div>
                </div>
              )}
              
              {/* PIX */}
              {form.paymentMethod === "pix" && (
                <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm text-blue-900">✓ Você receberá um QR Code para escanear com seu celular após confirmar o pedido.</p>
                </div>
              )}
              
              {/* Boleto */}
              {form.paymentMethod === "boleto" && (
                <div className="mt-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                  <p className="text-sm text-yellow-900">✓ Você receberá o código de barras para pagar em qualquer banco ou lotérica.</p>
                </div>
              )}
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm sticky top-24">
              <h2 className="font-bold text-gray-900 mb-4">Resumo do pedido</h2>

              <div className="space-y-2 mb-4">
                {items.map(item => (
                  <div key={item.productId} className="flex gap-2 text-sm">
                    <img src={item.image} alt={item.name} className="w-10 h-10 rounded-lg object-cover flex-shrink-0 bg-gray-50" />
                    <div className="flex-1 min-w-0">
                      <p className="text-gray-700 line-clamp-1 text-xs">{item.name}</p>
                      <p className="text-gray-500 text-xs">x{item.quantity}</p>
                    </div>
                    <span className="font-medium text-gray-800 text-xs whitespace-nowrap">
                      R$ {(item.price * item.quantity).toFixed(2).replace(".", ",")}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-100 pt-3 space-y-2 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>R$ {totalPrice.toFixed(2).replace(".", ",")}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Frete</span>
                  <span className={shipping === 0 ? "text-green-600 font-medium" : ""}>
                    {shipping === 0 ? "Grátis" : `R$ ${shipping.toFixed(2).replace(".", ",")}`}
                  </span>
                </div>
                <div className="flex justify-between font-bold text-base text-gray-900 border-t border-gray-100 pt-2">
                  <span>Total</span>
                  <span>R$ {total.toFixed(2).replace(".", ",")}</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={createOrder.isPending}
                className="mt-5 w-full bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white font-bold py-3.5 rounded-xl transition-all duration-150 active:scale-[0.97] flex items-center justify-center gap-2 shadow-md"
              >
                {createOrder.isPending ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Processando...</>
                ) : (
                  "Confirmar pedido"
                )}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
