import { useState, useMemo } from "react";
import { Link, useLocation } from "wouter";
import { Package, ShoppingCart, Plus, Edit2, Trash2, X, Loader2, LogOut, ShoppingBag, Save, BarChart3 } from "lucide-react";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
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

const COLORS = ["#ef4444", "#f97316", "#eab308", "#22c55e", "#3b82f6", "#8b5cf6"];

interface ProductForm {
  name: string; description: string; price: string; originalPrice: string;
  category: typeof CATEGORIES[number]; image: string; stock: number;
}

const emptyForm: ProductForm = {
  name: "", description: "", price: "", originalPrice: "",
  category: "eletronicos", image: "", stock: 10,
};

export default function AdminDashboard() {
  const [tab, setTab] = useState<"products" | "orders" | "reports">("products");
  const [reportPeriod, setReportPeriod] = useState<"day" | "week" | "month">("month");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<ProductForm>(emptyForm);
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: number; name: string } | null>(null);
  const { logout } = useAdmin();
  const [, navigate] = useLocation();

  const utils = trpc.useUtils();
  const { data: products = [], isLoading: loadingProducts } = trpc.products.listAdmin.useQuery(undefined, { refetchOnWindowFocus: false });
  const { data: orders = [], isLoading: loadingOrders } = trpc.orders.list.useQuery(undefined, { refetchOnWindowFocus: false, enabled: tab === "orders" || tab === "reports" });

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

  const handleDelete = async (id: number) => {
    await deleteMutation.mutateAsync({ id });
    setDeleteConfirm(null);
  };

  // Gerar dados de vendas
  const salesData = useMemo(() => {
    const now = new Date();
    const data: Array<{ name: string; vendas: number; receita: number }> = [];

    if (reportPeriod === "day") {
      // Últimos 7 dias
      for (let i = 6; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        const dayOrders = orders.filter((o: any) => {
          const orderDate = new Date(o.createdAt);
          return orderDate.toDateString() === date.toDateString();
        });
        const total = dayOrders.reduce((sum: number, o: any) => sum + (o.total || 0), 0);
        data.push({
          name: date.toLocaleDateString("pt-BR", { weekday: "short", month: "short", day: "numeric" }),
          vendas: dayOrders.length,
          receita: Math.round(total * 100) / 100,
        });
      }
    } else if (reportPeriod === "week") {
      // Últimas 4 semanas
      for (let i = 3; i >= 0; i--) {
        const startDate = new Date(now);
        startDate.setDate(startDate.getDate() - (i * 7 + 6));
        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + 6);
        const weekOrders = orders.filter((o: any) => {
          const orderDate = new Date(o.createdAt);
          return orderDate >= startDate && orderDate <= endDate;
        });
        const total = weekOrders.reduce((sum: number, o: any) => sum + (o.total || 0), 0);
        data.push({
          name: `Semana ${i + 1}`,
          vendas: weekOrders.length,
          receita: Math.round(total * 100) / 100,
        });
      }
    } else {
      // Últimos 12 meses
      for (let i = 11; i >= 0; i--) {
        const date = new Date(now);
        date.setMonth(date.getMonth() - i);
        const monthOrders = orders.filter((o: any) => {
          const orderDate = new Date(o.createdAt);
          return orderDate.getMonth() === date.getMonth() && orderDate.getFullYear() === date.getFullYear();
        });
        const total = monthOrders.reduce((sum: number, o: any) => sum + (o.total || 0), 0);
        data.push({
          name: date.toLocaleDateString("pt-BR", { month: "short" }),
          vendas: monthOrders.length,
          receita: Math.round(total * 100) / 100,
        });
      }
    }
    return data;
  }, [orders, reportPeriod]);

  // Dados por categoria
  const categoryData = useMemo(() => {
    return CATEGORIES.map(cat => {
      const catOrders = orders.filter((o: any) => o.items?.some((item: any) => {
        const product = products.find(p => p.id === item.productId);
        return product?.category === cat;
      }));
      const total = catOrders.reduce((sum: number, o: any) => sum + (o.total || 0), 0);
      return {
        name: CATEGORY_LABELS[cat],
        value: Math.round(total * 100) / 100,
        count: catOrders.length,
      };
    }).filter(d => d.value > 0);
  }, [orders, products]);

  const totalRevenue = useMemo(() => {
    return orders.reduce((sum: number, o: any) => sum + (o.total || 0), 0);
  }, [orders]);

  const totalOrders = orders.length;
  const avgOrderValue = totalOrders > 0 ? Math.round((totalRevenue / totalOrders) * 100) / 100 : 0;

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
            <p className="text-2xl font-bold text-gray-900">{totalOrders}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
            <p className="text-xs text-gray-500 mb-1">Receita Total</p>
            <p className="text-2xl font-bold text-green-600">R$ {totalRevenue.toFixed(2)}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
            <p className="text-xs text-gray-500 mb-1">Ticket Médio</p>
            <p className="text-2xl font-bold text-blue-600">R$ {avgOrderValue.toFixed(2)}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-fit mb-6 overflow-x-auto">
          <button
            onClick={() => setTab("products")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${tab === "products" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
          >
            <Package className="w-4 h-4" /> Produtos
          </button>
          <button
            onClick={() => setTab("orders")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${tab === "orders" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
          >
            <ShoppingCart className="w-4 h-4" /> Pedidos
          </button>
          <button
            onClick={() => setTab("reports")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${tab === "reports" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
          >
            <BarChart3 className="w-4 h-4" /> Relatórios
          </button>
        </div>

        {/* Reports Tab */}
        {tab === "reports" && (
          <div className="space-y-6">
            {/* Period Selector */}
            <div className="flex gap-2">
              <button
                onClick={() => setReportPeriod("day")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${reportPeriod === "day" ? "bg-red-600 text-white" : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"}`}
              >
                Por Dia
              </button>
              <button
                onClick={() => setReportPeriod("week")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${reportPeriod === "week" ? "bg-red-600 text-white" : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"}`}
              >
                Por Semana
              </button>
              <button
                onClick={() => setReportPeriod("month")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${reportPeriod === "month" ? "bg-red-600 text-white" : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"}`}
              >
                Por Mês
              </button>
            </div>

            {/* Sales Chart */}
            <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
              <h3 className="font-bold text-gray-900 mb-4">Vendas e Receita</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" stroke="#999" />
                  <YAxis stroke="#999" />
                  <Tooltip contentStyle={{ backgroundColor: "#fff", border: "1px solid #ccc", borderRadius: "8px" }} />
                  <Legend />
                  <Line type="monotone" dataKey="vendas" stroke="#ef4444" strokeWidth={2} name="Número de Vendas" />
                  <Line type="monotone" dataKey="receita" stroke="#22c55e" strokeWidth={2} name="Receita (R$)" />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Category Distribution */}
            {categoryData.length > 0 && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
                  <h3 className="font-bold text-gray-900 mb-4">Vendas por Categoria</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }) => `${name}: R$ ${value}`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => `R$ ${value}`} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
                  <h3 className="font-bold text-gray-900 mb-4">Top Categorias</h3>
                  <div className="space-y-3">
                    {categoryData.sort((a, b) => b.value - a.value).map((cat, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                          <span className="text-sm text-gray-700">{cat.name}</span>
                        </div>
                        <span className="text-sm font-semibold text-gray-900">R$ {cat.value.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

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
                          <td className="px-4 py-3 text-sm text-gray-900 font-medium">{p.name}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{CATEGORY_LABELS[p.category]}</td>
                          <td className="px-4 py-3 text-sm text-gray-900 font-semibold">R$ {parseFloat(p.price).toFixed(2)}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{p.stock}</td>
                          <td className="px-4 py-3"><span className={`text-xs font-semibold px-2 py-1 rounded-full ${p.active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>{p.active ? "Ativo" : "Inativo"}</span></td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button onClick={() => handleEdit(p)} className="text-blue-600 hover:text-blue-700 transition-colors" title="Editar produto">
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button onClick={() => setDeleteConfirm({ id: p.id, name: p.name })} className="text-red-600 hover:text-red-700 transition-colors" title="Deletar produto">
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

        {/* Delete Confirmation Modal */}
        {deleteConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm">
              <div className="p-6">
                <h3 className="font-bold text-gray-900 text-lg mb-2">Deletar Produto?</h3>
                <p className="text-gray-600 mb-6">Tem certeza que deseja deletar <strong>{deleteConfirm.name}</strong>? Esta acao nao pode ser desfeita.</p>
                <div className="flex gap-3 justify-end">
                  <button
                    onClick={() => setDeleteConfirm(null)}
                    className="px-4 py-2 rounded-lg text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={() => handleDelete(deleteConfirm.id)}
                    disabled={deleteMutation.isPending}
                    className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:opacity-60 transition-colors flex items-center gap-2"
                  >
                    {deleteMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                    {deleteMutation.isPending ? "Deletando..." : "Deletar"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Orders Tab */}
        {tab === "orders" && (
          <div>
            <h2 className="font-bold text-gray-900 mb-4">Gerenciar Pedidos</h2>
            {loadingOrders ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
              </div>
            ) : orders.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
                <ShoppingCart className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">Nenhum pedido ainda</p>
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b border-gray-100">
                      <tr>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">ID</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Cliente</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Total</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Data</th>
                        <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Ação</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {orders.map((o: any) => (
                        <tr key={o.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-3 text-sm text-gray-900 font-medium">#{o.id}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{o.customerName}</td>
                          <td className="px-4 py-3 text-sm text-gray-900 font-semibold">R$ {(o.total || 0).toFixed(2)}</td>
                          <td className="px-4 py-3"><span className={`text-xs font-semibold px-2 py-1 rounded-full ${STATUS_LABELS[o.status]?.color || "bg-gray-100 text-gray-600"}`}>{STATUS_LABELS[o.status]?.label || o.status}</span></td>
                          <td className="px-4 py-3 text-sm text-gray-600">{new Date(o.createdAt).toLocaleDateString("pt-BR")}</td>
                          <td className="px-4 py-3 text-right">
                            <select value={o.status} onChange={(e) => updateStatusMutation.mutate({ id: o.id, status: e.target.value as any })}
                              className="text-xs px-2 py-1 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500">
                              <option value="pendente">Pendente</option>
                              <option value="processando">Processando</option>
                              <option value="enviado">Enviado</option>
                              <option value="entregue">Entregue</option>
                              <option value="cancelado">Cancelado</option>
                            </select>
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
      </div>
    </div>
  );
}
