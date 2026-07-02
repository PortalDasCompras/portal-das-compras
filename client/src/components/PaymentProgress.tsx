import { CheckCircle2, Clock, Loader2, AlertCircle } from "lucide-react";

export type PaymentStep = "validating" | "creating_order" | "processing_payment" | "finalizing" | "success" | "error";

interface PaymentProgressProps {
  step: PaymentStep;
  message: string;
  progress: number; // 0-100
}

const stepConfig: Record<PaymentStep, { icon: React.ReactNode; label: string; color: string }> = {
  validating: {
    icon: <Loader2 className="w-6 h-6 animate-spin" />,
    label: "Validando dados",
    color: "text-blue-600",
  },
  creating_order: {
    icon: <Loader2 className="w-6 h-6 animate-spin" />,
    label: "Criando pedido",
    color: "text-blue-600",
  },
  processing_payment: {
    icon: <Loader2 className="w-6 h-6 animate-spin" />,
    label: "Processando pagamento",
    color: "text-blue-600",
  },
  finalizing: {
    icon: <Loader2 className="w-6 h-6 animate-spin" />,
    label: "Finalizando",
    color: "text-blue-600",
  },
  success: {
    icon: <CheckCircle2 className="w-6 h-6" />,
    label: "Pagamento confirmado",
    color: "text-green-600",
  },
  error: {
    icon: <AlertCircle className="w-6 h-6" />,
    label: "Erro no pagamento",
    color: "text-red-600",
  },
};

export function PaymentProgress({ step, message, progress }: PaymentProgressProps) {
  const config = stepConfig[step];
  const isComplete = step === "success";
  const isError = step === "error";

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between text-xs text-gray-600 mb-2">
          <span>Progresso do pagamento</span>
          <span>{progress}%</span>
        </div>
        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-500 ease-out ${
              isError ? "bg-red-500" : isComplete ? "bg-green-500" : "bg-blue-500"
            }`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Status Card */}
      <div
        className={`rounded-lg p-6 text-center transition-all duration-300 ${
          isError
            ? "bg-red-50 border border-red-200"
            : isComplete
              ? "bg-green-50 border border-green-200"
              : "bg-blue-50 border border-blue-200"
        }`}
      >
        <div className={`flex justify-center mb-4 ${config.color}`}>{config.icon}</div>
        <h3 className="font-semibold text-gray-900 mb-2">{config.label}</h3>
        <p className="text-sm text-gray-600">{message}</p>
      </div>

      {/* Step Timeline */}
      <div className="mt-6 space-y-3">
        {[
          { key: "validating", label: "Validar dados" },
          { key: "creating_order", label: "Criar pedido" },
          { key: "processing_payment", label: "Processar pagamento" },
          { key: "finalizing", label: "Finalizar" },
        ].map((s, idx) => {
          const isActive = step === s.key;
          const isDone =
            ["validating", "creating_order", "processing_payment", "finalizing"].indexOf(step) >
            ["validating", "creating_order", "processing_payment", "finalizing"].indexOf(s.key);

          return (
            <div key={s.key} className="flex items-center gap-3">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all ${
                  isDone
                    ? "bg-green-500 text-white"
                    : isActive
                      ? "bg-blue-500 text-white animate-pulse"
                      : "bg-gray-200 text-gray-600"
                }`}
              >
                {isDone ? "✓" : idx + 1}
              </div>
              <span
                className={`text-sm font-medium ${
                  isDone || isActive ? "text-gray-900" : "text-gray-500"
                }`}
              >
                {s.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
