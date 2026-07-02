import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Package, ShoppingCart, Plus, Edit2, Trash2, X, Loader2, LogOut, ChevronDown, ShoppingBag, Save } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useAdmin } from "@/contexts/AdminContext";
import { toast } from "sonner";

const CATEGORIES = ["beleza", "casa", "eletronicos", "esportes", "moda", "outros"] as const;
const CATEGORY_LABELS: Record<string, string> = {
  beleza: "Beleza", casa: "Casa", eletronicos: "Eletrônicos",
  esportes: "Esportes", moda: "Moda", outros: "Outros",
};
const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pendente: { label: "Pendente", color: "bg-yellow-100 text-yellow-700" },
  processando: { label: "Processando", color: "bg-blue-100 text-blue-700" },
  enviado: { label: "Enviado", color: "bg-purple-100 text-purple-700" },
  entregue: { label: "Entregue", color: "bg-green-100 text-green-700" },
  cancelado: { label: "Cancelado", color: "bg-red-100 text-red-700" },
};

interface ProductForm {
  name: string; description: string; price: string; originalPrice: string;
  category: typeof CATEGORIES[number]; image: string; stock: number;
}

const emptyForm: ProductForm = {
  name: "", description: "", price: "", originalPrice: "",
  category: "eletronicos", image: "", stock: 10,
};

export default function AdminDashboard() {
  const [tab, setTab] = useState<"products" | "orders">("products");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<ProductForm>(emptyForm);
  const { logout } = useAdmin();
  const [, navigate] = useLocation();

  const utils = trpc.useUtils();
  const { data: products = [], isLoading: loadingProducts } = trpc.products.listAdmin.useQuery(undefined, { refetchOnWindowFocus: false });
  const { data: orders = [], isLoading: loadingOrders } = trpc.orders.list.useQuery(undefined, { refetchOnWindowFocus: false, enabled: tab === "orders" });

  const createMutation = trpc.products.create.useMutation({
    onSuccess: () => { utils.products.listAdmin.invalidate(); toast.success("Produto criado!"); resetForm(); },
    onError: () => toast.error("Erro ao criar produto."),
  });
  const updateMutation = trpc.products.update.useMutation({
    onSuccess: () => { utils.products.listAdmin.invalidate(); toast.success("Produto atualizado!"); resetForm(); },
    onError: () => toast.error("Erro ao atualizar produto."),
  });
  const deleteMutation = trpc.products.delete.useMutation({
    onSuccess: () => { utils.products.listAdmin.invalidate(); toast.success("Produto removido!"); },
    onError: () => toast.error("Erro ao remover produto."),
  });
  const updateStatusMutation = trpc.orders.updateStatus.useMutation({
    onSuccess: () => { utils.orders.list.invalidate(); toast.success("Status atualizado!"); },
  });

  const resetForm = () => { setForm(emptyForm); setEditingId(null); setShowForm(false); };

  const handleEdit = (p: any) => {
    setForm({
      name: p.name, description: p.description ?? "", price: String(p.price),
      originalPrice: String(p.originalPrice), category: p.category, image: p.image, stock: p.stock,
    });
    setEditingId(p.id);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.price || !form.originalPrice || !form.image) {
      toast.error("Preencha todos os campos obrigatórios.");
      return;
    }
    if (editingId) {
      await updateMutation.mutateAsync({ id: editingId, ...form });
    } else {
      await createMutation.mutateAsync(form);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate("/admin");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="container">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-2 font-bold text-red-700">
              <ShoppingBag className="w-5 h-5" />
              <span>Portal das Compras</span>
              <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-medium ml-1">Admin</span>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/" className="text-sm text-gray-500 hover:text-red-600 transition-colors">Ver loja</Link>
              <button onClick={handleLogout} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-red-600 transition-colors">
                <LogOut className="w-4 h-4" />
                Sair
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="container py-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
            <p className="text-xs text-gray-500 mb-1">Total de Produtos</p>
            <p className="text-2xl font-bold text-gray-900">{products.length}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
            <p className="text-xs text-gray-500 mb-1">Pedidos</p>
            <p className="text-2xl font-bold text-gray-900">{orders.length}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
            <p className="text-xs text-gray-500 mb-1">Produtos Ativos</p>
            <p className="text-2xl font-bold text-green-600">{products.filter(p => p.active).length}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
            <p className="text-xs text-gray-500 mb-1">Pedidos Pendentes</p>
            <p className="text-2xl font-bold text-yellow-600">{orders.filter((o: any) => o.status === "pendente").length}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-fit mb-6">
          <button
            onClick={() => setTab("products")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${tab === "products" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
          >
            <Package className="w-4 h-4" /> Produtos
          </button>
          <button
            onClick={() => setTab("orders")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${tab === "orders" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
          >
            <ShoppingCart className="w-4 h-4" /> Pedidos
          </button>
        </div>

        {/* Products Tab */}
        {tab === "products" && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-900">Gerenciar Produtos</h2>
              <button
                onClick={() => { resetForm(); setShowForm(true); }}
                className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" /> Novo Produto
              </button>
            </div>

            {/* Product Form Modal */}
            {showForm && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
                <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                  <div className="flex items-center justify-between p-5 border-b border-gray-100">
                    <h3 className="font-bold text-gray-900">{editingId ? "Editar Produto" : "Novo Produto"}</h3>
                    <button onClick={resetForm} className="text-gray-400 hover:text-gray-600 transition-colors">
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <form onSubmit={handleSubmit} className="p-5 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nome *</label>
                      <input type="text" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500" required />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                      <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                        rows={3} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 resize-none" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Preço (R$) *</label>
                        <input type="number" step="0.01" min="0" value={form.price} onChange={e => setForm(p => ({ ...p, price: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500" required />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Preço Original (R$) *</label>
                        <input type="number" step="0.01" min="0" value={form.originalPrice} onChange={e => setForm(p => ({ ...p, originalPrice: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500" required />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Categoria *</label>
                        <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value as any }))}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500">
                          {CATEGORIES.map(c => <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Estoque *</label>
                        <input type="number" min="0" value={form.stock} onChange={e => setForm(p => ({ ...p, stock: parseInt(e.target.value) || 0 }))}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">URL da Imagem *</label>
                      <input type="url" value={form.image} onChange={e => setForm(p => ({ ...p, image: e.target.value }))}
                        placeholder="https://..." className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500" required />
                      {form.image && (
                        <img src={form.image} alt="Preview" className="mt-2 w-20 h-20 object-cover rounded-lg border border-gray-200" onError={e => (e.currentTarget.style.display = "none")} />
                      )}
                    </div>
                    <div className="flex gap-3 pt-2">
                      <button type="button" onClick={resetForm} className="flex-1 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors">
                        Cancelar
                      </button>
                      <button type="submit" disabled={createMutation.isPending || updateMutation.isPending}
                        className="flex-1 bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white font-semibold py-2.5 rounded-lg text-sm transition-colors flex items-center justify-center gap-2">
                        {(createMutation.isPending || updateMutation.isPending) ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        {editingId ? "Salvar" : "Criar"}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {loadingProducts ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b border-gray-100">
                      <tr>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Produto</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Categoria</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Preço</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Estoque</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                        <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {products.map((p: any) => (
                        <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <img src={p.image} alt={p.name} className="w-10 h-10 object-cover rounded-lg bg-gray-100 flex-shrink-0" />
                              <span className="font-medium text-gray-800 line-clamp-1 max-w-[200px]">{p.name}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-gray-600">{CATEGORY_LABELS[p.category]}</td>
                          <td className="px-4 py-3 font-semibold text-gray-900">R$ {parseFloat(p.price).toFixed(2).replace(".", ",")}</td>
                          <td className="px-4 py-3 text-gray-600">{p.stock}</td>
                          <td className="px-4 py-3">
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${p.active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                              {p.active ? "Ativo" : "Inativo"}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-end gap-2">
                              <button onClick={() => handleEdit(p)} className="p-1.5 text-gray-400 hover:text-blue-600 transition-colors rounded-md hover:bg-blue-50">
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button onClick={() => { if (confirm("Remover produto?")) deleteMutation.mutate({ id: p.id }); }}
                                className="p-1.5 text-gray-400 hover:text-red-600 transition-colors rounded-md hover:bg-red-50">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Orders Tab */}
        {tab === "orders" && (
          <div>
            <h2 className="font-bold text-gray-900 mb-4">Pedidos</h2>
            {loadingOrders ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-16 text-gray-400">
                <ShoppingCart className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>Nenhum pedido ainda.</p>
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b border-gray-100">
                      <tr>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Pedido</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Cliente</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Total</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Data</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {orders.map((o: any) => {
                        const statusInfo = STATUS_LABELS[o.status] ?? { label: o.status, color: "bg-gray-100 text-gray-600" };
                        return (
                          <tr key={o.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-4 py-3 font-mono text-gray-600">#{String(o.id).padStart(4, "0")}</td>
                            <td className="px-4 py-3">
                              <div>
                                <p className="font-medium text-gray-800">{o.customerName}</p>
                                <p className="text-xs text-gray-400">{o.customerEmail}</p>
                              </div>
                            </td>
                            <td className="px-4 py-3 font-semibold text-gray-900">R$ {parseFloat(o.total).toFixed(2).replace(".", ",")}</td>
                            <td className="px-4 py-3 text-gray-500 text-xs">
                              {new Date(o.createdAt).toLocaleDateString("pt-BR")}
                            </td>
                            <td className="px-4 py-3">
                              <select
                                value={o.status}
                                onChange={e => updateStatusMutation.mutate({ id: o.id, status: e.target.value as any })}
                                className={`text-xs px-2 py-1 rounded-full font-medium border-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-red-500 ${statusInfo.color}`}
                              >
                                {Object.entries(STATUS_LABELS).map(([val, info]) => (
                                  <option key={val} value={val}>{info.label}</option>
                                ))}
                              </select>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
