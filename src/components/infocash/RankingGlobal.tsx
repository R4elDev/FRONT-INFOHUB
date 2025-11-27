import { Trophy, TrendingUp } from 'lucide-react';
import type { UsuarioRanking } from '../../services/infocashService';

interface RankingGlobalProps {
  ranking: UsuarioRanking[];
  idUsuarioAtual?: number;
  loading: boolean;
}

export default function RankingGlobal({ ranking, idUsuarioAtual, loading }: RankingGlobalProps) {
  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Trophy className="w-5 h-5 text-gray-400" />
          <h2 className="font-bold text-gray-800">Ranking Global</h2>
        </div>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="bg-gray-100 rounded-xl h-16 animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  if (ranking.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Trophy className="w-5 h-5 text-yellow-600" />
          <h2 className="font-bold text-gray-800">Ranking Global</h2>
        </div>
        <div className="text-center py-8">
          <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">Ranking em breve</p>
        </div>
      </div>
    );
  }

  const getMedalha = (posicao: number) => {
    switch (posicao) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return null;
    }
  };

  const usuarioNoRanking = ranking.find(u => u.id_usuario === idUsuarioAtual);

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
      <div className="flex items-center gap-2 mb-4">
        <Trophy className="w-5 h-5 text-yellow-600" />
        <h2 className="font-bold text-gray-800">Ranking Global</h2>
        <span className="ml-auto px-3 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full font-bold flex items-center gap-1">
          <TrendingUp className="w-3 h-3" />
          Top {ranking.length}
        </span>
      </div>
      
      {/* Destacar posição do usuário atual se não estiver no top */}
      {usuarioNoRanking && usuarioNoRanking.posicao > 10 && (
        <div className="mb-4 p-4 bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-200 rounded-xl">
          <p className="text-xs text-purple-700 font-bold mb-2">Sua Posição</p>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-purple-500 flex items-center justify-center text-white font-bold">
              #{usuarioNoRanking.posicao}
            </div>
            <div className="flex-1">
              <p className="font-bold text-gray-800">{usuarioNoRanking.nome_usuario}</p>
              <p className="text-sm text-gray-600">{usuarioNoRanking.saldo_total.toLocaleString('pt-BR')} pontos</p>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {ranking.map((usuario) => {
          const isUsuarioAtual = usuario.id_usuario === idUsuarioAtual;
          const medalha = getMedalha(usuario.posicao);
          const posicao = usuario.posicao;

          return (
            <div
              key={usuario.id_usuario}
              className={`
                flex items-center gap-4 p-4 rounded-xl transition-all
                ${isUsuarioAtual 
                  ? 'bg-gradient-to-r from-purple-100 to-blue-100 border-2 border-purple-300 shadow-md' 
                  : posicao <= 3
                    ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200'
                    : 'bg-gray-50 border border-gray-200'
                }
                hover:shadow-lg
              `}
            >
              {/* Posição */}
              <div 
                className={`
                  flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center font-black text-lg
                  ${posicao === 1 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-white shadow-lg' : 
                    posicao === 2 ? 'bg-gradient-to-br from-gray-300 to-gray-500 text-white shadow-lg' :
                    posicao === 3 ? 'bg-gradient-to-br from-orange-400 to-orange-600 text-white shadow-lg' :
                    isUsuarioAtual ? 'bg-purple-500 text-white' :
                    'bg-white text-gray-600 border-2 border-gray-300'
                  }
                `}
              >
                {medalha || `#${posicao}`}
              </div>
              
              {/* Nome */}
              <div className="flex-1 min-w-0">
                <p className={`font-bold text-sm truncate ${isUsuarioAtual ? 'text-purple-900' : 'text-gray-800'}`}>
                  {usuario.nome_usuario}
                  {isUsuarioAtual && (
                    <span className="ml-2 text-xs bg-purple-500 text-white px-2 py-0.5 rounded-full">
                      Você
                    </span>
                  )}
                </p>
                <p className="text-xs text-gray-500">
                  {usuario.saldo_total.toLocaleString('pt-BR')} pontos
                </p>
              </div>
              
              {/* Badge de destaque */}
              {posicao <= 3 && (
                <div className="flex-shrink-0">
                  <div className={`
                    px-3 py-1 rounded-full text-xs font-bold
                    ${posicao === 1 ? 'bg-yellow-500 text-white' :
                      posicao === 2 ? 'bg-gray-400 text-white' :
                      'bg-orange-500 text-white'}
                  `}>
                    Top {posicao}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      {/* Info adicional */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <p className="text-xs text-gray-500 text-center">
          💡 Continue ganhando pontos para subir no ranking!
        </p>
      </div>
    </div>
  );
}
