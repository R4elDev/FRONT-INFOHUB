import React from 'react';
import { Lightbulb, TrendingUp, MapPin, Users, HelpCircle, BarChart3 } from 'lucide-react';
import { PERGUNTAS_EXEMPLO } from '../../services/chatService';

interface ChatSuggestionsProps {
  onSelect: (suggestion: string) => void;
  className?: string;
}

const suggestionIcons = [
  TrendingUp,  // Promoções
  MapPin,      // Localização
  Users,       // Usuários
  BarChart3,   // Estabelecimentos
  HelpCircle,  // Como funciona
  Lightbulb    // Resumo geral
];

const ChatSuggestions: React.FC<ChatSuggestionsProps> = ({ 
  onSelect, 
  className = '' 
}) => {
  return (
    <div className={`p-6 border-b border-gray-100 bg-gradient-to-br from-orange-50 to-green-50 ${className}`}>
      <div className="flex items-center gap-2 mb-4">
        <Lightbulb className="w-5 h-5 text-orange-600" />
        <h4 className="text-sm font-bold text-gray-800">
          Perguntas sugeridas
        </h4>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {PERGUNTAS_EXEMPLO.map((pergunta, index) => {
          const IconComponent = suggestionIcons[index] || HelpCircle;
          
          return (
            <button
              key={index}
              onClick={() => onSelect(pergunta)}
              className="
                group flex items-start gap-3 p-4 rounded-2xl 
                bg-white border-2 border-gray-100
                hover:border-orange-300 hover:bg-orange-50 
                hover:shadow-lg hover:scale-[1.02]
                transition-all duration-300 text-left
                focus:outline-none focus:ring-2 focus:ring-orange-500
              "
            >
              <div className="
                flex-shrink-0 w-8 h-8 rounded-xl
                bg-gradient-to-r from-orange-400 to-orange-600
                flex items-center justify-center
                group-hover:from-orange-500 group-hover:to-orange-700
                transition-all duration-300
              ">
                <IconComponent className="w-4 h-4 text-white" />
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 leading-relaxed group-hover:text-orange-900 transition-colors">
                  {pergunta}
                </p>
              </div>
            </button>
          );
        })}
      </div>
      
      <div className="mt-4 p-3 bg-white/60 rounded-xl border border-orange-200">
        <p className="text-xs text-gray-600 text-center">
          💡 <strong>Dica:</strong> Você pode fazer perguntas sobre produtos, preços, estabelecimentos e muito mais!
        </p>
      </div>
    </div>
  );
};

export default ChatSuggestions;
