// Sistema de validação centralizada
export interface ValidationError {
  field: string
  message: string
}

export interface ValidationResult {
  isValid: boolean
  errors: ValidationError[]
}

// Limites profissionais de caracteres
export const PROFESSIONAL_LIMITS = {
  // Pessoa Física
  NOME_MIN: 2,
  NOME_MAX: 100,
  
  // Pessoa Jurídica  
  NOME_EMPRESA_MIN: 2,
  NOME_EMPRESA_MAX: 150,
  RAZAO_SOCIAL_MIN: 2,
  RAZAO_SOCIAL_MAX: 200,
  
  // Geral
  EMAIL_MAX: 254, // RFC 5321 padrão
  TELEFONE_MIN: 10,
  TELEFONE_MAX: 15,
  SENHA_MIN: 8,
  SENHA_MAX: 128,
  
  // Endereço
  ENDERECO_MIN: 10,
  ENDERECO_MAX: 300,
  
  // Documentos
  CPF_LENGTH: 11,
  CNPJ_LENGTH: 14
}

// Validadores básicos
export const validators = {
  required: (value: string, fieldName: string): ValidationError | null => {
    if (!value || value.trim() === '') {
      return { field: fieldName, message: `${fieldName} é obrigatório` }
    }
    return null
  },

  email: (value: string): ValidationError | null => {
    if (value.length > PROFESSIONAL_LIMITS.EMAIL_MAX) {
      return { field: 'email', message: `Email deve ter no máximo ${PROFESSIONAL_LIMITS.EMAIL_MAX} caracteres` }
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(value)) {
      return { field: 'email', message: 'Email inválido' }
    }
    
    return null
  },

  emailCorporativo: (value: string): ValidationError | null => {
    const emailValidation = validators.email(value)
    if (emailValidation) return emailValidation
    
    const dominiosComuns = ['gmail.com', 'hotmail.com', 'yahoo.com', 'outlook.com']
    const dominio = value.split('@')[1]?.toLowerCase()
    
    if (dominiosComuns.includes(dominio)) {
      return { field: 'email', message: 'Para empresas, use um email corporativo (não Gmail, Hotmail, etc.)' }
    }
    
    return null
  },

  nome: (value: string, isEmpresa: boolean = false): ValidationError | null => {
    const minLength = isEmpresa ? PROFESSIONAL_LIMITS.NOME_EMPRESA_MIN : PROFESSIONAL_LIMITS.NOME_MIN
    const maxLength = isEmpresa ? PROFESSIONAL_LIMITS.NOME_EMPRESA_MAX : PROFESSIONAL_LIMITS.NOME_MAX
    const fieldName = isEmpresa ? 'Nome da empresa' : 'Nome'
    
    if (value.length < minLength) {
      return { field: 'nome', message: `${fieldName} deve ter pelo menos ${minLength} caracteres` }
    }
    
    if (value.length > maxLength) {
      return { field: 'nome', message: `${fieldName} deve ter no máximo ${maxLength} caracteres` }
    }
    
    // Validação de caracteres especiais
    if (!/^[a-zA-ZÀ-ÿ\s\-\.\']+$/.test(value)) {
      return { field: 'nome', message: `${fieldName} deve conter apenas letras, espaços, hífens e pontos` }
    }
    
    // Para empresas, permitir números e alguns caracteres especiais
    if (isEmpresa && !/^[a-zA-ZÀ-ÿ0-9\s\-\.\'&]+$/.test(value)) {
      return { field: 'nome', message: 'Nome da empresa contém caracteres inválidos' }
    }
    
    return null
  },

  razaoSocial: (value: string): ValidationError | null => {
    if (value.length < PROFESSIONAL_LIMITS.RAZAO_SOCIAL_MIN) {
      return { field: 'razaoSocial', message: `Razão social deve ter pelo menos ${PROFESSIONAL_LIMITS.RAZAO_SOCIAL_MIN} caracteres` }
    }
    
    if (value.length > PROFESSIONAL_LIMITS.RAZAO_SOCIAL_MAX) {
      return { field: 'razaoSocial', message: `Razão social deve ter no máximo ${PROFESSIONAL_LIMITS.RAZAO_SOCIAL_MAX} caracteres` }
    }
    
    // Validação de caracteres para razão social
    if (!/^[a-zA-ZÀ-ÿ0-9\s\-\.\'&]+$/.test(value)) {
      return { field: 'razaoSocial', message: 'Razão social contém caracteres inválidos' }
    }
    
    return null
  },

  cpf: (value: string): ValidationError | null => {
    const cpfLimpo = value.replace(/[^\d]/g, '')
    
    if (cpfLimpo.length !== 11) {
      return { field: 'cpf', message: 'CPF deve ter 11 dígitos' }
    }
    
    if (/^(\d)\1{10}$/.test(cpfLimpo)) {
      return { field: 'cpf', message: 'CPF inválido' }
    }
    
    // Validação dos dígitos verificadores
    let soma = 0
    for (let i = 0; i < 9; i++) {
      soma += parseInt(cpfLimpo.charAt(i)) * (10 - i)
    }
    let resto = 11 - (soma % 11)
    if (resto === 10 || resto === 11) resto = 0
    if (resto !== parseInt(cpfLimpo.charAt(9))) {
      return { field: 'cpf', message: 'CPF inválido' }
    }
    
    soma = 0
    for (let i = 0; i < 10; i++) {
      soma += parseInt(cpfLimpo.charAt(i)) * (11 - i)
    }
    resto = 11 - (soma % 11)
    if (resto === 10 || resto === 11) resto = 0
    if (resto !== parseInt(cpfLimpo.charAt(10))) {
      return { field: 'cpf', message: 'CPF inválido' }
    }
    
    return null
  },

  cnpj: (value: string): ValidationError | null => {
    const cnpjLimpo = value.replace(/[^\d]/g, '')
    
    if (cnpjLimpo.length !== 14) {
      return { field: 'cnpj', message: 'CNPJ deve ter 14 dígitos' }
    }
    
    if (/^(\d)\1{13}$/.test(cnpjLimpo)) {
      return { field: 'cnpj', message: 'CNPJ inválido' }
    }
    
    // Validação dos dígitos verificadores do CNPJ
    let soma = 0
    let peso = 2
    
    // Primeiro dígito verificador
    for (let i = 11; i >= 0; i--) {
      soma += parseInt(cnpjLimpo.charAt(i)) * peso
      peso = peso === 9 ? 2 : peso + 1
    }
    
    let resto = soma % 11
    const digito1 = resto < 2 ? 0 : 11 - resto
    
    if (parseInt(cnpjLimpo.charAt(12)) !== digito1) {
      return { field: 'cnpj', message: 'CNPJ inválido' }
    }
    
    // Segundo dígito verificador
    soma = 0
    peso = 2
    
    for (let i = 12; i >= 0; i--) {
      soma += parseInt(cnpjLimpo.charAt(i)) * peso
      peso = peso === 9 ? 2 : peso + 1
    }
    
    resto = soma % 11
    const digito2 = resto < 2 ? 0 : 11 - resto
    
    if (parseInt(cnpjLimpo.charAt(13)) !== digito2) {
      return { field: 'cnpj', message: 'CNPJ inválido' }
    }
    
    return null
  },

  telefone: (value: string): ValidationError | null => {
    const telefoneLimpo = value.replace(/[^\d]/g, '')
    
    if (telefoneLimpo.length < PROFESSIONAL_LIMITS.TELEFONE_MIN) {
      return { field: 'telefone', message: `Telefone deve ter pelo menos ${PROFESSIONAL_LIMITS.TELEFONE_MIN} dígitos` }
    }
    
    if (telefoneLimpo.length > PROFESSIONAL_LIMITS.TELEFONE_MAX) {
      return { field: 'telefone', message: `Telefone deve ter no máximo ${PROFESSIONAL_LIMITS.TELEFONE_MAX} dígitos` }
    }
    
    // Validação específica para telefones brasileiros
    if (telefoneLimpo.length !== 10 && telefoneLimpo.length !== 11) {
      return { field: 'telefone', message: 'Telefone deve ter 10 ou 11 dígitos (formato brasileiro)' }
    }
    
    // Validação de DDD válido (11-99)
    const ddd = parseInt(telefoneLimpo.substring(0, 2))
    if (ddd < 11 || ddd > 99) {
      return { field: 'telefone', message: 'DDD inválido' }
    }
    
    return null
  },

  senha: (value: string): ValidationError | null => {
    if (value.length < PROFESSIONAL_LIMITS.SENHA_MIN) {
      return { field: 'senha', message: `Senha deve ter pelo menos ${PROFESSIONAL_LIMITS.SENHA_MIN} caracteres` }
    }
    
    if (value.length > PROFESSIONAL_LIMITS.SENHA_MAX) {
      return { field: 'senha', message: `Senha deve ter no máximo ${PROFESSIONAL_LIMITS.SENHA_MAX} caracteres` }
    }
    
    // Validações de segurança profissional
    const hasLowerCase = /[a-z]/.test(value)
    const hasUpperCase = /[A-Z]/.test(value)
    const hasNumbers = /\d/.test(value)
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(value)
    
    if (!hasLowerCase) {
      return { field: 'senha', message: 'Senha deve conter pelo menos uma letra minúscula' }
    }
    
    if (!hasUpperCase) {
      return { field: 'senha', message: 'Senha deve conter pelo menos uma letra maiúscula' }
    }
    
    if (!hasNumbers) {
      return { field: 'senha', message: 'Senha deve conter pelo menos um número' }
    }
    
    if (!hasSpecialChar) {
      return { field: 'senha', message: 'Senha deve conter pelo menos um caractere especial (!@#$%^&*...)' }
    }
    
    // Verificar sequências comuns
    const sequenciasComuns = ['123456', 'abcdef', 'qwerty', 'password', '123abc']
    const senhaLower = value.toLowerCase()
    
    for (const sequencia of sequenciasComuns) {
      if (senhaLower.includes(sequencia)) {
        return { field: 'senha', message: 'Senha não pode conter sequências comuns' }
      }
    }
    
    return null
  },

  endereco: (value: string): ValidationError | null => {
    if (value.length < PROFESSIONAL_LIMITS.ENDERECO_MIN) {
      return { field: 'endereco', message: `Endereço deve ter pelo menos ${PROFESSIONAL_LIMITS.ENDERECO_MIN} caracteres` }
    }
    
    if (value.length > PROFESSIONAL_LIMITS.ENDERECO_MAX) {
      return { field: 'endereco', message: `Endereço deve ter no máximo ${PROFESSIONAL_LIMITS.ENDERECO_MAX} caracteres` }
    }
    
    // Validação básica de endereço brasileiro
    if (!/^[a-zA-ZÀ-ÿ0-9\s\-\.\,\/]+$/.test(value)) {
      return { field: 'endereco', message: 'Endereço contém caracteres inválidos' }
    }
    
    return null
  },

  senhasIguais: (senha: string, confirmarSenha: string): ValidationError | null => {
    if (senha !== confirmarSenha) {
      return { field: 'confirmarSenha', message: 'As senhas não coincidem' }
    }
    return null
  }
}

// Validação para formulário de cadastro
export const validateCadastro = (data: {
  nome: string
  email: string
  senha: string
  confirmarSenha: string
  telefone: string
  cpf?: string
  cnpj?: string
  tipoPessoa: 'consumidor' | 'estabelecimento'
  razaoSocial?: string
  endereco?: string
}): ValidationResult => {
  const errors: ValidationError[] = []
  const isEmpresa = data.tipoPessoa === 'estabelecimento'

  // Validações de nome com limites profissionais
  const requiredError = validators.required(data.nome, isEmpresa ? 'Nome da empresa' : 'Nome')
  if (requiredError) errors.push(requiredError)
  else {
    const nomeError = validators.nome(data.nome, isEmpresa)
    if (nomeError) errors.push(nomeError)
  }

  // Validações de email (permitir email pessoal para todos)
  const emailRequiredError = validators.required(data.email, 'Email')
  if (emailRequiredError) errors.push(emailRequiredError)
  else {
    // Usar validação padrão de email para todos os tipos
    const emailError = validators.email(data.email)
    if (emailError) errors.push(emailError)
  }

  // Validações de senha com critérios profissionais
  const senhaError = validators.senha(data.senha)
  if (senhaError) errors.push(senhaError)

  const senhasIguaisError = validators.senhasIguais(data.senha, data.confirmarSenha)
  if (senhasIguaisError) errors.push(senhasIguaisError)

  // Validações de telefone
  const telefoneRequiredError = validators.required(data.telefone, 'Telefone')
  if (telefoneRequiredError) errors.push(telefoneRequiredError)
  else {
    const telefoneError = validators.telefone(data.telefone)
    if (telefoneError) errors.push(telefoneError)
  }

  // Validações específicas por tipo
  if (data.tipoPessoa === 'consumidor') {
    if (data.cpf && data.cpf.trim()) {
      const cpfError = validators.cpf(data.cpf)
      if (cpfError) errors.push(cpfError)
    } else {
      errors.push({ field: 'cpf', message: 'CPF é obrigatório' })
    }
  } else {
    // Validações para empresas
    if (data.cnpj && data.cnpj.trim()) {
      const cnpjError = validators.cnpj(data.cnpj)
      if (cnpjError) errors.push(cnpjError)
    } else {
      errors.push({ field: 'cnpj', message: 'CNPJ é obrigatório' })
    }

    // Razão social para empresas (opcional)
    if (data.razaoSocial && data.razaoSocial.trim()) {
      const razaoSocialError = validators.razaoSocial(data.razaoSocial)
      if (razaoSocialError) errors.push(razaoSocialError)
    }

    // Endereço para empresas (opcional)
    if (data.endereco && data.endereco.trim()) {
      const enderecoError = validators.endereco(data.endereco)
      if (enderecoError) errors.push(enderecoError)
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

// Validação para login
export const validateLogin = (data: {
  email: string
  senha: string
}): ValidationResult => {
  const errors: ValidationError[] = []

  const emailRequiredError = validators.required(data.email, 'Email')
  if (emailRequiredError) errors.push(emailRequiredError)
  else {
    const emailError = validators.email(data.email)
    if (emailError) errors.push(emailError)
  }

  const senhaRequiredError = validators.required(data.senha, 'Senha')
  if (senhaRequiredError) errors.push(senhaRequiredError)

  return {
    isValid: errors.length === 0,
    errors
  }
}
