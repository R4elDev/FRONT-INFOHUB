// ARQUIVO TEMPORÁRIO PARA TESTE DE CURTIDAS
// Execute no console: import { testarCurtida } from './services/testarCurtida'
// E depois: testarCurtida()

import api from '../lib/api';

export async function testarCurtida() {
  console.log('🧪 ========== TESTE DE CURTIDA ==========');
  
  const userData = localStorage.getItem('user_data');
  if (!userData) {
    console.error('❌ Usuário não logado!');
    return;
  }
  
  const user = JSON.parse(userData);
  const idPost = 1; // Post de teste
  
  console.log('👤 Usuário logado:', user);
  console.log('📝 ID do Post:', idPost);
  
  // Testar diferentes payloads no endpoint que retornou 500
  const endpoint = `/post/${idPost}/curtir`;
  
  const payloads = [
    { name: 'Payload 1 - id_usuario', data: { id_usuario: user.id } },
    { name: 'Payload 2 - usuario_id', data: { usuario_id: user.id } },
    { name: 'Payload 3 - userId', data: { userId: user.id } },
    { name: 'Payload 4 - id_post + id_usuario', data: { id_post: idPost, id_usuario: user.id } },
    { name: 'Payload 5 - apenas id', data: { id: user.id } },
    { name: 'Payload 6 - vazio', data: {} },
    { name: 'Payload 7 - completo', data: { id_post: idPost, id_usuario: user.id, usuario_id: user.id } },
  ];
  
  for (const payload of payloads) {
    console.log(`\n🔍 Testando: ${payload.name}`);
    console.log(`📦 Payload:`, JSON.stringify(payload.data, null, 2));
    
    try {
      const response = await api.post(endpoint, payload.data);
      console.log(`✅ FUNCIONOU COM: ${payload.name}!`);
      console.log(`📥 Resposta:`, response.data);
      console.log(`🎯 ESTE É O PAYLOAD CORRETO!`);
      break; // Para no primeiro que funcionar
    } catch (err: any) {
      console.error(`❌ ${payload.name} falhou:`, {
        status: err.response?.status,
        mensagem: err.response?.data?.message || err.message,
        erro_completo: err.response?.data
      });
    }
  }
  
  console.log('\n🧪 ========== FIM DO TESTE ==========');
}

// Para usar no console do navegador:
// 1. Abra o console (F12)
// 2. Cole: testarCurtida()
(window as any).testarCurtida = testarCurtida;
