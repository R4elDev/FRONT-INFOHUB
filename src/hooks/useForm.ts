import { useState, useCallback } from 'react'
import type { ValidationResult, ValidationError } from '../utils/validation'

interface UseFormOptions<T> {
  initialValues: T
  validate?: (values: T) => ValidationResult
  onSubmit?: (values: T) => Promise<void> | void
}

export function useForm<T extends Record<string, any>>({
  initialValues,
  validate,
  onSubmit
}: UseFormOptions<T>) {
  const [values, setValues] = useState<T>(initialValues)
  const [errors, setErrors] = useState<ValidationError[]>([])
  const [touched, setTouched] = useState<Record<keyof T, boolean>>({} as Record<keyof T, boolean>)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Atualizar valor de um campo
  const setValue = useCallback((field: keyof T, value: any) => {
    setValues(prev => ({ ...prev, [field]: value }))
    
    // Limpar erro do campo quando o usuário digita
    if (errors.some(error => error.field === field)) {
      setErrors(prev => prev.filter(error => error.field !== field))
    }
  }, [errors])

  // Marcar campo como tocado
  const setFieldTouched = useCallback((field: keyof T) => {
    setTouched(prev => ({ ...prev, [field]: true }))
  }, [])

  // Validar formulário
  const validateForm = useCallback(() => {
    if (!validate) return { isValid: true, errors: [] }
    
    const result = validate(values)
    setErrors(result.errors)
    return result
  }, [validate, values])

  // Obter erro de um campo específico
  const getFieldError = useCallback((field: keyof T) => {
    return errors.find(error => error.field === field)?.message
  }, [errors])

  // Verificar se campo tem erro e foi tocado
  const hasFieldError = useCallback((field: keyof T) => {
    return touched[field] && !!getFieldError(field)
  }, [touched, getFieldError])

  // Submeter formulário
  const handleSubmit = useCallback(async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    
    // Marcar todos os campos como tocados
    const allTouched = Object.keys(values).reduce((acc, key) => {
      acc[key as keyof T] = true
      return acc
    }, {} as Record<keyof T, boolean>)
    setTouched(allTouched)
    
    const result = validateForm()
    
    if (result.isValid && onSubmit) {
      setIsSubmitting(true)
      try {
        await onSubmit(values)
      } catch (error) {
        console.error('Erro ao submeter formulário:', error)
      } finally {
        setIsSubmitting(false)
      }
    }
    
    return result
  }, [values, validateForm, onSubmit])

  // Reset do formulário
  const reset = useCallback(() => {
    setValues(initialValues)
    setErrors([])
    setTouched({} as Record<keyof T, boolean>)
    setIsSubmitting(false)
  }, [initialValues])

  return {
    values,
    errors,
    touched,
    isSubmitting,
    setValue,
    setFieldTouched,
    validateForm,
    getFieldError,
    hasFieldError,
    handleSubmit,
    reset,
    isValid: errors.length === 0
  }
}
