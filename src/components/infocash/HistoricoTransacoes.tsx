import { useState } from 'react';
import { Calendar, ChevronDown } from 'lucide-react';
import type { TransacaoHistorico } from '../../services/infocashService';

interface HistoricoTransacoesProps {
  transacoes: TransacaoHistorico[];
  loading: boolean;
}

const tiposAcao: Record<string, { icone: string; label: string; cor: string }> = {
  'avaliacao_promocao': {
    icone: '🎯',
    label: 'Avaliação de Promoção',
    cor: '#FF6B6B'
  },
  'avaliacao_empresa': {
    icone: '⭐',
    label: 'Avaliação de Empresa',
    cor: '#FFD93D'
  },
  'comentario_comunidade': {
    icone: '💬',
    label: 'Comentário na Comunidade',
    cor: '#9B59B6'
  },
  'curtida_post': {
    icone: '❤️',
    label: 'Curtida em Post',
    cor: '#E91E63'
  },
  'manual': {
    icone: '🎁',
    label: 'Bônus Especial',
    cor: '#A8E6CF'
  }
};

export default function HistoricoTransacoes({ transacoes, loading }: HistoricoTransacoesProps) {
  const [mostrarTodos, setMostrarTodos] = useState(false);
  const transacoesExibidas = mostrarTodos ? transacoes : transacoes.slice(0, 10);

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="w-5 h-5 text-gray-400" />
          <h2 className="font-bold text-gray-800">Histórico de Transações</h2>
        </div>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-3"></div>
          <p className="text-sm text-gray-500">Carregando transações...</p>
        </div>
      </div>
    );
  }

  if (transacoes.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="w-5 h-5 text-gray-400" />
          <h2 className="font-bold text-gray-800">Histórico de Transações</h2>
        </div>
        <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-xl">
          <span className="text-6xl mb-4 block">🚀</span>
          <p className="text-gray-500 font-medium mb-2">Nenhuma transação ainda</p>
          <p className="text-sm text-gray-400">Comece a ganhar pontos!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
      <div className="flex items-center gap-2 mb-4">
        <Calendar className="w-5 h-5 text-purple-600" />
        <h2 className="font-bold text-gray-800">Histórico de Transações</h2>
        <span className="ml-auto px-3 py-1 bg-purple-100 text-purple-700 text-xs rounded-full font-bold">
          {transacoes.length} {transacoes.length === 1 ? 'transação' : 'transações'}
        </span>
      </div>
      
      <div className="space-y-3 max-h-[500px] overflow-y-auto">
        {transacoesExibidas.map((transacao) => {
          const tipo = tiposAcao[transacao.tipo_acao] || tiposAcao['manual'];
          const data = new Date(transacao.data_transacao);
          const dataFormatada = data.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: '2-digit'
          });
          const horaFormatada = data.toLocaleTimeString('pt-BR', {
            hour: '2-digit',
            minute: '2-digit'
          });

          return (
            <div
              key={transacao.id_transacao}
              className="flex items-start gap-4 p-4 bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-200 hover:shadow-md transition-all"
            >
              {/* Ícone */}
              <div 
                className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow-sm"
                style={{ backgroundColor: `${tipo.cor}20` }}
              >
                {tipo.icone}
              </div>
              
              {/* Conteúdo */}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-800 text-sm mb-1">
                  {tipo.label}
                </p>
                <p className="text-xs text-gray-500 mb-2">
                  {transacao.descricao}
                </p>
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <Calendar className="w-3 h-3" />
                  <span>{dataFormatada}</span>
                  <span>•</span>
                  <span>{horaFormatada}</span>
                </div>
              </div>
              
              {/* Pontos */}
              <div className="flex-shrink-0 text-right">
                <p 
                  className="font-bold text-lg"
                  style={{ color: transacao.pontos > 0 ? '#27ae60' : '#e74c3c' }}
                >
                  {transacao.pontos > 0 ? '+' : ''}{transacao.pontos}
                </p>
                <p className="text-xs text-gray-500">pontos</p>
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Botão Ver Mais */}
      {transacoes.length > 10 && (
        <button
          onClick={() => setMostrarTodos(!mostrarTodos)}
          className="w-full mt-4 py-3 bg-gradient-to-r from-purple-50 to-blue-50 hover:from-purple-100 hover:to-blue-100 border border-purple-200 rounded-xl font-semibold text-purple-700 transition-all flex items-center justify-center gap-2"
        >
          {mostrarTodos ? 'Ver Menos' : `Ver Mais (${transacoes.length - 10} transações)`}
          <ChevronDown className={`w-4 h-4 transition-transform ${mostrarTodos ? 'rotate-180' : ''}`} />
        </button>
      )}
    </div>
  );
}
