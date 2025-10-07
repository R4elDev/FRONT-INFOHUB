// Sistema de validação centralizada
export interface ValidationError {
  field: string
  message: string
}

export interface ValidationResult {
  isValid: boolean
  errors: ValidationError[]
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
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(value)) {
      return { field: 'email', message: 'Email inválido' }
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
    
    return null
  },

  telefone: (value: string): ValidationError | null => {
    const telefoneLimpo = value.replace(/[^\d]/g, '')
    if (telefoneLimpo.length !== 10 && telefoneLimpo.length !== 11) {
      return { field: 'telefone', message: 'Telefone deve ter 10 ou 11 dígitos' }
    }
    return null
  },

  senha: (value: string): ValidationError | null => {
    if (value.length < 6) {
      return { field: 'senha', message: 'Senha deve ter pelo menos 6 caracteres' }
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
}): ValidationResult => {
  const errors: ValidationError[] = []

  // Validações obrigatórias
  const requiredError = validators.required(data.nome, 'Nome')
  if (requiredError) errors.push(requiredError)

  const emailRequiredError = validators.required(data.email, 'Email')
  if (emailRequiredError) errors.push(emailRequiredError)
  else {
    const emailError = validators.email(data.email)
    if (emailError) errors.push(emailError)
  }

  const senhaError = validators.senha(data.senha)
  if (senhaError) errors.push(senhaError)

  const senhasIguaisError = validators.senhasIguais(data.senha, data.confirmarSenha)
  if (senhasIguaisError) errors.push(senhasIguaisError)

  const telefoneRequiredError = validators.required(data.telefone, 'Telefone')
  if (telefoneRequiredError) errors.push(telefoneRequiredError)
  else {
    const telefoneError = validators.telefone(data.telefone)
    if (telefoneError) errors.push(telefoneError)
  }

  // Validações específicas por tipo
  if (data.tipoPessoa === 'consumidor') {
    if (data.cpf) {
      const cpfError = validators.cpf(data.cpf)
      if (cpfError) errors.push(cpfError)
    } else {
      errors.push({ field: 'cpf', message: 'CPF é obrigatório' })
    }
  } else {
    if (data.cnpj) {
      const cnpjError = validators.cnpj(data.cnpj)
      if (cnpjError) errors.push(cnpjError)
    } else {
      errors.push({ field: 'cnpj', message: 'CNPJ é obrigatório' })
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
