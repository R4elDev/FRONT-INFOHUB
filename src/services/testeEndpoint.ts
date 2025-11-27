// ARQUIVO TEMPORÁRIO PARA TESTE
// Execute este código no console do navegador para testar os endpoints

import api from '../lib/api';

export async function testarEndpoints() {
  console.log('🧪 ========== TESTE DE ENDPOINTS ==========');
  
  // Teste 1: GET /post/1/comentarios
  console.log('\n🧪 Teste 1: GET /post/1/comentarios');
  try {
    const res1 = await api.get('/post/1/comentarios');
    console.log('✅ Sucesso! Status:', res1.status);
    console.log('📦 Dados:', res1.data);
    console.log('📊 Tipo:', typeof res1.data);
    console.log('📊 É array?:', Array.isArray(res1.data));
    if (Array.isArray(res1.data)) {
      console.log('📊 Total:', res1.data.length);
      if (res1.data.length > 0) {
        console.log('📋 Primeiro item:', JSON.stringify(res1.data[0], null, 2));
      }
    }
  } catch (err: any) {
    console.error('❌ Erro:', err.response?.status, err.response?.data);
  }
  
  // Teste 2: GET /comentarios
  console.log('\n🧪 Teste 2: GET /comentarios');
  try {
    const res2 = await api.get('/comentarios');
    console.log('✅ Sucesso! Status:', res2.status);
    console.log('📦 Dados:', res2.data);
    console.log('📊 Tipo:', typeof res2.data);
    console.log('📊 É array?:', Array.isArray(res2.data));
    if (Array.isArray(res2.data)) {
      console.log('📊 Total:', res2.data.length);
      if (res2.data.length > 0) {
        console.log('📋 Primeiro item:', JSON.stringify(res2.data[0], null, 2));
      }
    }
  } catch (err: any) {
    console.error('❌ Erro:', err.response?.status, err.response?.data);
  }
  
  // Teste 3: GET /posts (só para confirmar que não existe)
  console.log('\n🧪 Teste 3: GET /posts');
  try {
    const res3 = await api.get('/posts');
    console.log('✅ Sucesso! Status:', res3.status);
    console.log('📦 Dados:', res3.data);
  } catch (err: any) {
    console.error('❌ Erro (esperado):', err.response?.status, err.response?.data);
  }
  
  console.log('\n🧪 ========== FIM DOS TESTES ==========');
}

// Para usar: 
// import { testarEndpoints } from './services/testeEndpoint'
// testarEndpoints()
