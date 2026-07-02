import { useState } from "react";
import { useLocation } from "wouter";
import { ShoppingBag, Lock, User, Loader2, Eye, EyeOff } from "lucide-react";
import { useAdmin } from "@/contexts/AdminContext";
import { toast } from "sonner";

export default function AdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login, isLocked, lockTimeRemaining, failedAttempts } = useAdmin();
  const [, navigate] = useLocation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      toast.error("Preencha usuário e senha.");
      return;
    }
    setLoading(true);
    try {
      await login(username, password);
      navigate("/admin-portal-claysson/dashboard");
    } catch (error: any) {
      toast.error(error.message || "Acesso negado");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 text-red-700 font-bold text-xl mb-2">
            <ShoppingBag className="w-6 h-6" />
            <span>Portal das Compras</span>
          </div>
          <h1 className="text-xl font-bold text-gray-900">Entrar no admin</h1>
          <p className="text-sm text-gray-500 mt-1">Acesse o painel de gestão da loja.</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          {/* Dica de credenciais - REMOVER EM PRODUÇÃO */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
            <p className="text-xs text-blue-700 font-medium">📝 Credenciais:</p>
            <p className="text-xs text-blue-600 mt-1"><strong>Usuário:</strong> claysson</p>
            <p className="text-xs text-blue-600"><strong>Senha:</strong> 1508</p>
          </div>

          {isLocked ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
              <p className="text-sm text-red-700 font-bold mb-2">🔒 Acesso Bloqueado</p>
              <p className="text-xs text-red-600 mb-3">Muitas tentativas falhadas.</p>
              <p className="text-sm text-red-700 font-bold">{lockTimeRemaining}s</p>
              <p className="text-xs text-red-600 mt-1">Tente novamente em alguns momentos.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Usuário</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    placeholder="Usuário"
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                    autoComplete="username"
                    disabled={loading}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Senha"
                    className="w-full pl-10 pr-10 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                    autoComplete="current-password"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    disabled={loading}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white font-bold py-3 rounded-xl transition-all duration-150 active:scale-[0.97] flex items-center justify-center gap-2 mt-2"
              >
                {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Entrando...</> : "Entrar"}
              </button>

              {failedAttempts > 0 && (
                <p className="text-xs text-gray-500 text-center mt-2">
                  Tentativas falhadas: {failedAttempts}/5
                </p>
              )}
            </form>
          )}
        </div>

        <p className="text-center mt-4">
          <a href="/" className="text-sm text-gray-500 hover:text-red-600 transition-colors">← Voltar para a loja</a>
        </p>
      </div>
    </div>
  );
}
