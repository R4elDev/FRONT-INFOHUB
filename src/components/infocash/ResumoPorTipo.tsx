import { Target } from 'lucide-react';
import type { ResumoPorTipo } from '../../services/infocashService';

interface ResumoPorTipoProps {
  resumo: ResumoPorTipo[];
  loading: boolean;
}

const tiposAcao: Record<string, { icone: string; label: string; cor: string; corBg: string }> = {
  // Tipos do backend
  'curtir': {
    icone: '❤️',
    label: 'Curtidas',
    cor: '#E91E63',
    corBg: '#FCE4EC'
  },
  'criar_post': {
    icone: '✍️',
    label: 'Posts Criados',
    cor: '#9B59B6',
    corBg: '#F4ECF7'
  },
  'comentar': {
    icone: '💬',
    label: 'Comentários',
    cor: '#3498DB',
    corBg: '#EBF5FB'
  },
  'compartilhar': {
    icone: '🔗',
    label: 'Compartilhamentos',
    cor: '#1ABC9C',
    corBg: '#E8F8F5'
  },
  'avaliar_produto': {
    icone: '⭐',
    label: 'Avaliações Produtos',
    cor: '#FFD93D',
    corBg: '#FFF8E1'
  },
  'compra': {
    icone: '🛒',
    label: 'Compras',
    cor: '#27AE60',
    corBg: '#E9F7EF'
  },
  'primeira_compra': {
    icone: '🎉',
    label: 'Primeira Compra',
    cor: '#F39C12',
    corBg: '#FEF5E7'
  },
  // Tipos legados (compatibilidade)
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

// Tipo padrão para ações não mapeadas
const tipoDefault = {
  icone: '💰',
  label: 'Outros',
  cor: '#95A5A6',
  corBg: '#F2F3F4'
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

  // Normalizar dados do backend - garantir que total_pontos é número
  const resumoNormalizado = resumo.map(item => ({
    ...item,
    total_pontos: Number(item.total_pontos) || 0,
    total_transacoes: Number(item.total_transacoes) || 0
  }));

  // Usar apenas os dados que vieram do backend (não forçar tipos fixos)
  const totalGeral = resumoNormalizado.reduce((acc, r) => acc + r.total_pontos, 0);
  
  // Helper para pegar tipo ou default
  const getTipoInfo = (tipoAcao: string) => {
    return tiposAcao[tipoAcao] || { ...tipoDefault, label: tipoAcao };
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
      <div className="flex items-center gap-2 mb-4">
        <Target className="w-5 h-5 text-purple-600" />
        <h2 className="font-bold text-gray-800">Resumo de Ganhos</h2>
        <span className="ml-auto px-3 py-1 bg-green-100 text-green-700 text-xs rounded-full font-bold">
          {totalGeral} pts totais
        </span>
      </div>
      
      {resumoNormalizado.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500 text-sm">Nenhum ganho registrado ainda</p>
          <p className="text-gray-400 text-xs mt-1">Curta posts, comente e interaja para ganhar pontos!</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {resumoNormalizado.map((item) => {
            const tipo = getTipoInfo(item.tipo_acao);
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
      )}
    </div>
  );
}
