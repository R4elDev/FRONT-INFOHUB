/**
 * Serviço de Upload para Azure Blob Storage
 * Container: infohubfotos
 * Storage Account: infohubstorage
 */

// Configurações do Azure Blob Storage
// IMPORTANTE: O SAS Token precisa ter permissão de LEITURA (r) para exibir imagens
// Permissões necessárias: r (read), c (create), w (write)
const AZURE_CONFIG = {
  storageAccount: 'infohubstorage',
  containerName: 'infohubfotos',
  // Token para UPLOAD (create, write)
  sasTokenUpload: 'sp=cw&st=2025-11-27T02:49:12Z&se=2025-12-12T15:00:00Z&sv=2024-11-04&sr=c&sig=KwdC4ievGnVlKJSDHjwRongfdcaq8kCW%2BU8KssM1F%2Bo%3D',
  // Token para LEITURA - PRECISA GERAR NO AZURE COM PERMISSÃO 'r' (read)
  // OU tornar o container público (mais fácil)
  sasTokenRead: '', // Deixar vazio se container for público
}

// URL base do container
const getContainerUrl = () => {
  return `https://${AZURE_CONFIG.storageAccount}.blob.core.windows.net/${AZURE_CONFIG.containerName}`
}

// Gera um nome único para o arquivo
const generateUniqueFileName = (originalName: string): string => {
  const timestamp = Date.now()
  const randomId = Math.random().toString(36).substring(2, 8)
  const extension = originalName.split('.').pop()?.toLowerCase() || 'jpg'
  return `produto_${timestamp}_${randomId}.${extension}`
}

/**
 * Faz upload de uma imagem para o Azure Blob Storage
 * @param file - Arquivo de imagem (File)
 * @returns URL pública da imagem ou null em caso de erro
 */
export async function uploadImageToAzure(file: File): Promise<string | null> {
  try {
    // Validações
    if (!file) {
      console.error('❌ Nenhum arquivo fornecido')
      return null
    }

    // Validar tipo de arquivo
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      console.error('❌ Tipo de arquivo não permitido:', file.type)
      throw new Error('Tipo de arquivo não permitido. Use PNG, JPG ou WEBP.')
    }

    // Validar tamanho (5MB máximo)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      console.error('❌ Arquivo muito grande:', file.size)
      throw new Error('Arquivo muito grande. Máximo 5MB.')
    }

    // Gera nome único para o arquivo
    const blobName = generateUniqueFileName(file.name)
    
    // URL completa do blob com SAS token para upload
    const blobUrl = `${getContainerUrl()}/${blobName}?${AZURE_CONFIG.sasTokenUpload}`
    
    console.log('📤 Iniciando upload para Azure...')
    console.log('📁 Nome do arquivo:', blobName)
    console.log('📦 Tamanho:', (file.size / 1024).toFixed(2), 'KB')

    // Faz o upload usando PUT request
    const response = await fetch(blobUrl, {
      method: 'PUT',
      headers: {
        'x-ms-blob-type': 'BlockBlob',
        'Content-Type': file.type,
      },
      body: file,
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ Erro no upload Azure:', response.status, errorText)
      throw new Error(`Erro no upload: ${response.status} - ${response.statusText}`)
    }

    // URL pública da imagem (sem o token SAS para exibição)
    const publicUrl = `${getContainerUrl()}/${blobName}`
    
    console.log('✅ Upload concluído com sucesso!')
    console.log('🔗 URL da imagem:', publicUrl)

    return publicUrl
  } catch (error: any) {
    console.error('❌ Erro ao fazer upload para Azure:', error)
    throw error
  }
}

/**
 * Valida se um arquivo é uma imagem válida
 * @param file - Arquivo a ser validado
 * @returns Objeto com status e mensagem de erro se houver
 */
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
  const maxSize = 5 * 1024 * 1024 // 5MB

  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'Tipo de arquivo não permitido. Use PNG, JPG ou WEBP.'
    }
  }

  if (file.size > maxSize) {
    return {
      valid: false,
      error: 'Arquivo muito grande. Máximo 5MB.'
    }
  }

  return { valid: true }
}

export default {
  uploadImageToAzure,
  validateImageFile,
}
