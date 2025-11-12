import React, { useEffect } from 'react';
import { Bot, Sparkles, MessageCircle, TrendingUp } from 'lucide-react';
import ChatComponent from '../../components/Chat/ChatComponent';
import { ChatProvider } from '../../contexts/ChatContext';
import '../../styles/chat.css';

const ChatPage: React.FC = () => {
  useEffect(() => {
    document.title = 'InfoHub IA - Assistente Inteligente';
  }, []);

  return (
    <ChatProvider>
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-green-50">
        {/* Header da página */}
        <div className="bg-white border-b-2 border-gray-100 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-orange-500 to-orange-600 flex items-center justify-center shadow-lg">
                  <Bot className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    InfoHub IA
                    <Sparkles className="w-6 h-6 text-orange-500" />
                  </h1>
                  <p className="text-gray-600">Assistente inteligente para suas consultas</p>
                </div>
              </div>
              
              <div className="hidden md:flex items-center gap-6">
                <div className="flex items-center gap-2 px-4 py-2 bg-green-100 rounded-xl">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-green-800">Online</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Conteúdo principal */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            
            {/* Sidebar com informações */}
            <div className="lg:col-span-1 space-y-6">
              
              {/* Card de boas-vindas */}
              <div className="bg-white rounded-3xl p-6 shadow-infohub border-2 border-gray-100">
                <div className="text-center mb-4">
                  <div className="w-16 h-16 mx-auto bg-gradient-to-r from-orange-400 to-orange-600 rounded-2xl flex items-center justify-center mb-3">
                    <MessageCircle className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">Bem-vindo!</h3>
                  <p className="text-sm text-gray-600">Faça perguntas sobre o InfoHub</p>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-xl">
                    <TrendingUp className="w-5 h-5 text-orange-600" />
                    <span className="text-sm font-medium text-orange-800">Promoções ativas</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-green-50 rounded-xl">
                    <Bot className="w-5 h-5 text-green-600" />
                    <span className="text-sm font-medium text-green-800">IA sempre disponível</span>
                  </div>
                </div>
              </div>

              {/* Estatísticas */}
              <div className="bg-white rounded-3xl p-6 shadow-infohub border-2 border-gray-100">
                <h4 className="font-bold text-gray-900 mb-4">📊 Estatísticas</h4>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Consultas hoje</span>
                    <span className="font-bold text-orange-600">127</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Tempo médio</span>
                    <span className="font-bold text-green-600">1.2s</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Satisfação</span>
                    <span className="font-bold text-blue-600">98%</span>
                  </div>
                </div>
              </div>

              {/* Dicas */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl p-6 border-2 border-blue-100">
                <h4 className="font-bold text-blue-900 mb-3">💡 Dicas</h4>
                <ul className="space-y-2 text-sm text-blue-800">
                  <li>• Seja específico nas perguntas</li>
                  <li>• Use palavras-chave relevantes</li>
                  <li>• Pergunte sobre preços e promoções</li>
                  <li>• Consulte estabelecimentos próximos</li>
                </ul>
              </div>
            </div>

            {/* Chat principal */}
            <div className="lg:col-span-3">
              <div className="h-[700px]">
                <ChatComponent className="h-full chat-container" />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-white border-t-2 border-gray-100 mt-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Bot className="w-4 h-4" />
                <span>Powered by InfoHub IA • Versão 1.0.0</span>
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span>Resposta média: 1.2s</span>
                <span>•</span>
                <span>Disponibilidade: 99.9%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ChatProvider>
  );
};

export default ChatPage;
