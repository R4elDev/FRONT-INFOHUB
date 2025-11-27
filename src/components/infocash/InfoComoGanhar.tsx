import { Sparkles } from 'lucide-react';

const acoesDisponiveis = [
  {
    icone: '🎯',
    nome: 'Avalie promoções',
    pontos: 5,
    descricao: 'Dê sua opinião sobre promoções'
  },
  {
    icone: '⭐',
    nome: 'Avalie empresas',
    pontos: 7,
    descricao: 'Compartilhe sua experiência'
  },
  {
    icone: '💬',
    nome: 'Comente na comunidade',
    pontos: 3,
    descricao: 'Participe das discussões'
  },
  {
    icone: '❤️',
    nome: 'Curta posts',
    pontos: 1,
    descricao: 'Interaja com a comunidade'
  }
];

export default function InfoComoGanhar() {
  return (
    <div className="bg-gradient-to-br from-purple-50 via-white to-blue-50 rounded-2xl shadow-lg border border-purple-100 p-6">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-5 h-5 text-purple-600" />
        <h2 className="font-bold text-gray-800">Como Ganhar Pontos?</h2>
      </div>
      
      <p className="text-sm text-gray-600 mb-4">
        Participe ativamente da plataforma e acumule pontos para trocar por recompensas!
      </p>
      
      <div className="space-y-3">
        {acoesDisponiveis.map((acao, index) => (
          <div
            key={index}
            className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-200 hover:shadow-md hover:border-purple-200 transition-all group cursor-pointer"
          >
            {/* Ícone */}
            <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
              {acao.icone}
            </div>
            
            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className="font-bold text-gray-800 text-sm mb-0.5">
                {acao.nome}
              </p>
              <p className="text-xs text-gray-500">
                {acao.descricao}
              </p>
            </div>
            
            {/* Pontos */}
            <div className="flex-shrink-0 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full shadow-sm">
              <p className="text-white font-black text-sm">
                +{acao.pontos} pts
              </p>
            </div>
          </div>
        ))}
      </div>
      
      {/* Dica */}
      <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-xl">
        <div className="flex items-start gap-3">
          <span className="text-2xl">💡</span>
          <div className="flex-1">
            <p className="text-xs font-bold text-blue-900 mb-1">
              Dica de Ouro
            </p>
            <p className="text-xs text-blue-700">
              Quanto mais você contribui, mais pontos ganha! Complete todas as atividades diárias para bônus especiais.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
