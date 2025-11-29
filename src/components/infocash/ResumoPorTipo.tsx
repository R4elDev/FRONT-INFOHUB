import { Target } from 'lucide-react';
import type { ResumoPorTipo } from '../../services/infocashService';

interface ResumoPorTipoProps {
  resumo: ResumoPorTipo[];
  loading: boolean;
}

const tiposAcao: Record<string, { icone: string; label: string; cor: string; corBg: string }> = {
  'avaliacao_promocao': {
    icone: '🎯',
    label: 'Avaliações Promoções',
    cor: '#FF6B6B',
    corBg: '#FFE5E5'
  },
  'avaliacao_empresa': {
    icone: '⭐',
    label: 'Avaliações Empresas',
    cor: '#FFD93D',
    corBg: '#FFF8E1'
  },
  'comentario_comunidade': {
    icone: '💬',
    label: 'Comentários',
    cor: '#9B59B6',
    corBg: '#F4ECF7'
  },
  'curtida_post': {
    icone: '❤️',
    label: 'Curtidas',
    cor: '#E91E63',
    corBg: '#FCE4EC'
  }
};

export default function ResumoPorTipo({ resumo, loading }: ResumoPorTipoProps) {
  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Target className="w-5 h-5 text-gray-400" />
          <h2 className="font-bold text-gray-800">Resumo de Ganhos</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-gray-100 rounded-xl h-32 animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  // Garantir que temos dados para todos os tipos
  const todosOsTipos = Object.keys(tiposAcao);
  const resumoCompleto = todosOsTipos.map(tipo => {
    const dadosExistentes = resumo.find(r => r.tipo_acao === tipo);
    return dadosExistentes || {
      tipo_acao: tipo,
      total_transacoes: 0,
      total_pontos: 0
    };
  });

  const totalGeral = resumoCompleto.reduce((acc, r) => acc + r.total_pontos, 0);

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
      <div className="flex items-center gap-2 mb-4">
        <Target className="w-5 h-5 text-purple-600" />
        <h2 className="font-bold text-gray-800">Resumo de Ganhos</h2>
        <span className="ml-auto px-3 py-1 bg-green-100 text-green-700 text-xs rounded-full font-bold">
          {totalGeral} pts totais
        </span>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {resumoCompleto.map((item) => {
          const tipo = tiposAcao[item.tipo_acao];
          const percentual = totalGeral > 0 ? (item.total_pontos / totalGeral) * 100 : 0;

          return (
            <div
              key={item.tipo_acao}
              className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-4 border border-gray-200 hover:shadow-lg transition-all cursor-pointer"
            >
              {/* Ícone e Tipo */}
              <div className="flex items-center gap-2 mb-3">
                <div 
                  className="w-10 h-10 rounded-lg flex items-center justify-center text-xl shadow-sm"
                  style={{ backgroundColor: tipo.corBg }}
                >
                  {tipo.icone}
                </div>
                <p className="font-bold text-xs text-gray-700">{tipo.label}</p>
              </div>
              
              {/* Pontos */}
              <div className="mb-3">
                <p 
                  className="text-2xl font-black mb-1"
                  style={{ color: tipo.cor }}
                >
                  {item.total_pontos}
                </p>
                <p className="text-xs text-gray-500">pontos</p>
              </div>
              
              {/* Transações */}
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-600">
                  {item.total_transacoes}x
                </span>
                {percentual > 0 && (
                  <span 
                    className="font-bold"
                    style={{ color: tipo.cor }}
                  >
                    {percentual.toFixed(0)}%
                  </span>
                )}
              </div>
              
              {/* Barra de progresso */}
              <div className="mt-3 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ 
                    width: `${percentual}%`,
                    backgroundColor: tipo.cor
                  }}
                ></div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
