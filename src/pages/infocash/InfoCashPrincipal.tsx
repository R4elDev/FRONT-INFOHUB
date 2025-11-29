import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Coins, MessageCircle, Plus, Users } from 'lucide-react';
import SidebarLayout from '../../components/layouts/SidebarLayout';
import CardSaldo from '../../components/infocash/CardSaldo';
import HistoricoTransacoes from '../../components/infocash/HistoricoTransacoes';
import ResumoPorTipo from '../../components/infocash/ResumoPorTipo';
import RankingGlobal from '../../components/infocash/RankingGlobal';
import InfoComoGanhar from '../../components/infocash/InfoComoGanhar';
import ComunidadeCompacta from '../../components/infocash/ComunidadeCompacta';
import infocashService from '../../services/infocashService';
import { useUser } from '../../contexts/UserContext';

export default function InfoCashPrincipal() {
  const { user } = useUser();
  const navigate = useNavigate();
  
  // Estados para dados
  const [saldo, setSaldo] = useState(0);
  const [nivel, setNivel] = useState({ nivel: 'Bronze', cor: '#CD7F32', proximoNivel: 100 });
  const [historico, setHistorico] = useState<any[]>([]);
  const [resumo, setResumo] = useState<any[]>([]);
  const [ranking, setRanking] = useState<any[]>([]);
  const [ultimaAtualizacao, setUltimaAtualizacao] = useState<string>('');
  
  // Estados de loading
  const [loadingSaldo, setLoadingSaldo] = useState(true);
  const [loadingHistorico, setLoadingHistorico] = useState(true);
  const [loadingResumo, setLoadingResumo] = useState(true);
  const [loadingRanking, setLoadingRanking] = useState(true);

  // Carregar todos os dados
  useEffect(() => {
    if (user?.id) {
      carregarDados();
    }
  }, [user?.id]);

  const carregarDados = async () => {
    if (!user?.id) return;

    // Usar endpoint otimizado /perfil quando possível
    carregarPerfilCompleto();
    carregarHistorico();
    carregarRanking();
  };

  const carregarPerfilCompleto = async () => {
    if (!user?.id) return;
    
    try {
      setLoadingSaldo(true);
      setLoadingResumo(true);

      const response = await infocashService.getPerfilCompleto(user.id);
      
      if (response.status && response.data) {
        // Saldo
        setSaldo(response.data.saldo || 0);
        setUltimaAtualizacao(new Date().toISOString());
        
        // Nível
        const nivelInfo = infocashService.getNivelUsuario(response.data.saldo || 0);
        setNivel(nivelInfo);
        
        // Resumo por tipo
        setResumo(response.data.resumo_por_tipo || []);
      }
    } catch (error) {
      console.error('Erro ao carregar perfil completo:', error);
      
      // Fallback: carregar saldo e resumo separadamente
      carregarSaldoSeparado();
      carregarResumoSeparado();
    } finally {
      setLoadingSaldo(false);
      setLoadingResumo(false);
    }
  };

  const carregarSaldoSeparado = async () => {
    if (!user?.id) return;
    
    try {
      const response = await infocashService.getSaldo(user.id);
      
      if (response.status && response.data) {
        setSaldo(response.data.saldo || 0);
        setUltimaAtualizacao(new Date().toISOString());
        
        const nivelInfo = infocashService.getNivelUsuario(response.data.saldo || 0);
        setNivel(nivelInfo);
      }
    } catch (error) {
      console.error('Erro ao carregar saldo:', error);
    }
  };

  const carregarResumoSeparado = async () => {
    if (!user?.id) return;
    
    try {
      const response = await infocashService.getResumoPorTipo(user.id);
      
      if (response.status && response.data) {
        setResumo(response.data);
      }
    } catch (error) {
      console.error('Erro ao carregar resumo:', error);
    }
  };

  const carregarHistorico = async () => {
    if (!user?.id) return;
    
    try {
      setLoadingHistorico(true);
      
      const response = await infocashService.getHistorico(user.id, 50);
      
      if (response.status && response.data) {
        setHistorico(response.data);
      }
    } catch (error) {
      console.error('Erro ao carregar histórico:', error);
    } finally {
      setLoadingHistorico(false);
    }
  };

  const carregarRanking = async () => {
    try {
      setLoadingRanking(true);
      
      const response = await infocashService.getRanking(10);
      
      if (response.status && response.data) {
        setRanking(response.data);
      }
    } catch (error) {
      console.error('Erro ao carregar ranking:', error);
    } finally {
      setLoadingRanking(false);
    }
  };

  const handleAtualizar = () => {
    carregarDados();
  };

  return (
    <SidebarLayout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-purple-50 p-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center shadow-lg">
              <Coins className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-gray-800">
                💰 InfoCash
              </h1>
              <p className="text-gray-600">Sistema de Pontos e Recompensas</p>
            </div>
          </div>
        </div>

        {/* Grid Principal */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Saldo - 2 colunas */}
          <div className="lg:col-span-2">
            <CardSaldo
              saldo={saldo}
              nivel={nivel.nivel}
              nivelCor={nivel.cor}
              proximoNivel={nivel.proximoNivel}
              loading={loadingSaldo}
              onAtualizar={handleAtualizar}
              ultimaAtualizacao={ultimaAtualizacao}
            />
          </div>

          {/* Ranking - 1 coluna */}
          <div>
            <RankingGlobal
              ranking={ranking}
              idUsuarioAtual={user?.id}
              loading={loadingRanking}
            />
          </div>
        </div>

        {/* Resumo por Tipo */}
        <div className="mb-6">
          <ResumoPorTipo
            resumo={resumo}
            loading={loadingResumo}
          />
        </div>

        {/* Grid Secundário */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Histórico - 2 colunas */}
          <div className="lg:col-span-2">
            <HistoricoTransacoes
              transacoes={historico}
              loading={loadingHistorico}
            />
          </div>

          {/* Como Ganhar - 1 coluna */}
          <div>
            <InfoComoGanhar />
          </div>
        </div>

        {/* Acesso à Comunidade */}
        <div className="bg-gradient-to-br from-purple-50 via-white to-blue-50 rounded-2xl shadow-lg border border-purple-200 p-8">
          <div className="text-center mb-6">
            <div className="flex items-center justify-center gap-3 mb-3">
              <Users className="w-8 h-8 text-purple-600" />
              <h2 className="text-2xl font-bold text-gray-800">Comunidade InfoHub</h2>
            </div>
            <p className="text-gray-600">
              Participe, compartilhe e ganhe pontos interagindo com a comunidade
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Botão Ver Comunidade */}
            <button
              onClick={() => navigate('/infocash/comentarios')}
              className="group relative overflow-hidden bg-white hover:bg-gradient-to-r hover:from-purple-500 hover:to-blue-500 border-2 border-purple-300 hover:border-transparent rounded-xl p-6 transition-all duration-300 hover:scale-105 hover:shadow-xl"
            >
              <div className="relative z-10 flex flex-col items-center gap-3">
                <div className="p-3 bg-purple-100 group-hover:bg-white/20 rounded-full transition-colors">
                  <MessageCircle className="w-8 h-8 text-purple-600 group-hover:text-white transition-colors" />
                </div>
                <div className="text-center">
                  <h3 className="text-lg font-bold text-gray-800 group-hover:text-white transition-colors mb-1">
                    Ver Posts
                  </h3>
                  <p className="text-sm text-gray-600 group-hover:text-white/90 transition-colors">
                    Explore discussões e interaja com a comunidade
                  </p>
                </div>
                <div className="mt-2 text-sm font-semibold text-purple-600 group-hover:text-white transition-colors flex items-center gap-2">
                  <span>Acessar Comunidade</span>
                  <span className="text-xl">→</span>
                </div>
              </div>
            </button>

            {/* Botão Criar Post */}
            <button
              onClick={() => navigate('/infocash/novo-comentario')}
              className="group relative overflow-hidden bg-white hover:bg-gradient-to-r hover:from-green-500 hover:to-emerald-500 border-2 border-green-300 hover:border-transparent rounded-xl p-6 transition-all duration-300 hover:scale-105 hover:shadow-xl"
            >
              <div className="relative z-10 flex flex-col items-center gap-3">
                <div className="p-3 bg-green-100 group-hover:bg-white/20 rounded-full transition-colors">
                  <Plus className="w-8 h-8 text-green-600 group-hover:text-white transition-colors" />
                </div>
                <div className="text-center">
                  <h3 className="text-lg font-bold text-gray-800 group-hover:text-white transition-colors mb-1">
                    Criar Post
                  </h3>
                  <p className="text-sm text-gray-600 group-hover:text-white/90 transition-colors">
                    Compartilhe suas descobertas e ganhe +3 pontos
                  </p>
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <span className="px-3 py-1 bg-green-100 group-hover:bg-white/20 text-green-700 group-hover:text-white text-xs font-bold rounded-full transition-colors">
                    +3 HubCoins
                  </span>
                </div>
              </div>
            </button>
          </div>

          {/* Preview Rápido */}
          <div className="mt-6 pt-6 border-t border-purple-200">
            <ComunidadeCompacta />
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            💡 Cada ponto vale R$ 0,01 • Troque seus pontos por descontos e benefícios
          </p>
        </div>
      </div>
    </SidebarLayout>
  );
}
