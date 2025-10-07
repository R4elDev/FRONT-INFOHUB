import { Button } from "../../components/ui/button"
import { useNavigate } from "react-router-dom"
import { CheckCircle, Package, MapPin, CreditCard, Clock } from "lucide-react"
import SidebarLayout from "../../components/layouts/SidebarLayout"

function PagamentoSucesso() {
  const navigate = useNavigate()

  // Dados do pedido (virão do contexto depois)
  const pedido = {
    numero: "#12345",
    data: new Date().toLocaleDateString('pt-BR'),
    hora: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    total: 31.97,
    formaPagamento: "Cartão de Crédito",
    endereco: "Rua Exemplo, 123 - Centro, São Paulo - SP",
    previsaoEntrega: "30-45 minutos"
  }

  return (
    <SidebarLayout>
      <div className="min-h-[80vh] flex items-center justify-center py-8">
        <div className="w-full max-w-2xl">
          {/* Card Principal */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-[0_8px_30px_rgba(0,0,0,0.12)] p-8 sm:p-12 text-center">
            {/* Ícone de Sucesso */}
            <div className="mb-6 flex justify-center">
              <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center animate-bounce">
                <CheckCircle className="w-16 h-16 text-green-600" />
              </div>
            </div>

            {/* Título */}
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-3">
              Pedido Realizado!
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              Seu pedido foi confirmado com sucesso
            </p>

            {/* Número do Pedido */}
            <div className="bg-gradient-to-r from-[#F9A01B] to-[#FF8C00] rounded-2xl p-6 mb-8">
              <p className="text-white text-sm font-semibold mb-2">Número do Pedido</p>
              <p className="text-white text-3xl font-bold">{pedido.numero}</p>
              <p className="text-white/80 text-sm mt-2">
                {pedido.data} às {pedido.hora}
              </p>
            </div>

            {/* Detalhes do Pedido */}
            <div className="space-y-4 mb-8 text-left">
              {/* Previsão de Entrega */}
              <div className="flex items-start gap-4 p-4 bg-blue-50 rounded-xl">
                <Clock className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                <div>
                  <p className="font-bold text-gray-800">Previsão de Entrega</p>
                  <p className="text-gray-600">{pedido.previsaoEntrega}</p>
                </div>
              </div>

              {/* Endereço */}
              <div className="flex items-start gap-4 p-4 bg-orange-50 rounded-xl">
                <MapPin className="w-6 h-6 text-[#F9A01B] flex-shrink-0 mt-1" />
                <div>
                  <p className="font-bold text-gray-800">Endereço de Entrega</p>
                  <p className="text-gray-600">{pedido.endereco}</p>
                </div>
              </div>

              {/* Forma de Pagamento */}
              <div className="flex items-start gap-4 p-4 bg-green-50 rounded-xl">
                <CreditCard className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                <div>
                  <p className="font-bold text-gray-800">Forma de Pagamento</p>
                  <p className="text-gray-600">{pedido.formaPagamento}</p>
                </div>
              </div>

              {/* Total */}
              <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
                <Package className="w-6 h-6 text-gray-600 flex-shrink-0 mt-1" />
                <div className="flex-1">
                  <p className="font-bold text-gray-800">Total do Pedido</p>
                  <p className="text-2xl font-bold text-green-600">R$ {pedido.total.toFixed(2)}</p>
                </div>
              </div>
            </div>

            {/* Mensagem */}
            <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6 mb-8">
              <p className="text-gray-700 leading-relaxed">
                🎉 <strong>Obrigado pela sua compra!</strong><br/>
                Você receberá atualizações sobre o status do seu pedido por e-mail e SMS.
              </p>
            </div>

            {/* Botões */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                onClick={() => navigate('/HomeInicial')}
                className="flex-1 h-14 bg-gradient-to-r from-[#F9A01B] to-[#FF8C00] hover:from-[#FF8C00] hover:to-[#F9A01B] text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all hover:scale-105"
              >
                Voltar ao Início
              </Button>
              <Button
                onClick={() => navigate('/promocoes')}
                variant="outline"
                className="flex-1 h-14 border-2 border-[#F9A01B] text-[#F9A01B] hover:bg-[#F9A01B] hover:text-white font-bold rounded-xl transition-all"
              >
                Continuar Comprando
              </Button>
            </div>
          </div>

          {/* Informação Adicional */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Precisa de ajuda? Entre em contato com nosso suporte
            </p>
          </div>
        </div>
      </div>
    </SidebarLayout>
  )
}

export default PagamentoSucesso
