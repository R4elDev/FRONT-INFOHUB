import { Coins, TrendingUp, RefreshCcw } from 'lucide-react';

interface CardSaldoProps {
  saldo: number;
  nivel: string;
  nivelCor: string;
  proximoNivel: number;
  loading: boolean;
  onAtualizar: () => void;
  ultimaAtualizacao?: string;
}

export default function CardSaldo({ 
  saldo, 
  nivel, 
  nivelCor, 
  proximoNivel, 
  loading, 
  onAtualizar,
  ultimaAtualizacao 
}: CardSaldoProps) {
  const progresso = (saldo / proximoNivel) * 100;

  return (
    <div className="relative bg-gradient-to-br from-[#667eea] via-[#764ba2] to-[#667eea] rounded-3xl shadow-2xl p-8 overflow-hidden">
      {/* Efeito de partículas/blur */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute w-40 h-40 rounded-full bg-white top-0 right-0 transform translate-x-20 -translate-y-20 blur-3xl"></div>
        <div className="absolute w-32 h-32 rounded-full bg-white bottom-0 left-0 transform -translate-x-16 translate-y-16 blur-3xl"></div>
      </div>
      
      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Coins className="w-8 h-8 text-white" />
            </div>
            <div>
              <p className="text-white/90 text-sm font-medium">Saldo Atual</p>
              <p className="text-white text-xs opacity-80">InfoCash Points</p>
            </div>
          </div>
          
          <button
            onClick={onAtualizar}
            disabled={loading}
            className="p-3 rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur-sm transition-all disabled:opacity-50"
            title="Atualizar saldo"
          >
            <RefreshCcw className={`w-5 h-5 text-white ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
        
        {/* Saldo em destaque */}
        <div className="mb-6">
          <div className="flex items-baseline gap-3 mb-2">
            <span 
              className="text-6xl font-black text-white" 
              style={{ textShadow: '0 4px 20px rgba(0,0,0,0.3)' }}
            >
              {loading ? '...' : saldo.toLocaleString('pt-BR')}
            </span>
            <span className="text-3xl font-bold text-white/80">pts</span>
          </div>
          <p className="text-white/70 text-sm">
            ≈ R$ {(saldo * 0.01).toFixed(2)}
          </p>
        </div>
        
        {/* Barra de Progresso */}
        <div className="bg-white/20 backdrop-blur-sm rounded-full p-1 mb-4">
          <div className="relative h-4 bg-white/10 rounded-full overflow-hidden">
            <div 
              className="absolute inset-0 bg-gradient-to-r from-green-400 via-yellow-300 to-white rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${Math.min(progresso, 100)}%` }}
            >
              <div className="absolute inset-0 bg-white/30 animate-pulse"></div>
            </div>
          </div>
        </div>
        
        {/* Info do Nível */}
        <div className="flex items-center justify-between text-white/90 text-sm">
          <div className="flex items-center gap-2">
            <span className="font-semibold">Nível:</span>
            <span 
              className="px-3 py-1 rounded-full font-bold"
              style={{ backgroundColor: nivelCor, color: '#fff' }}
            >
              {nivel}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            <span className="text-xs">
              Próximo: {proximoNivel.toLocaleString('pt-BR')} pts
            </span>
          </div>
        </div>
        
        {/* Última atualização */}
        {ultimaAtualizacao && (
          <p className="text-white/60 text-xs mt-4 text-center">
            Última atualização: {new Date(ultimaAtualizacao).toLocaleString('pt-BR')}
          </p>
        )}
      </div>
    </div>
  );
}
