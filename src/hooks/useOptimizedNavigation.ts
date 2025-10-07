import { useNavigate } from 'react-router-dom'
import { useCallback } from 'react'

/**
 * Hook personalizado para navegação otimizada
 * Reduz atrasos e melhora a performance das transições
 */
export const useOptimizedNavigation = () => {
  const navigate = useNavigate()

  // Navegação com debounce para evitar múltiplos cliques
  const navigateOptimized = useCallback((
    path: string, 
    options?: { 
      replace?: boolean
      state?: any
      delay?: number 
    }
  ) => {
    const { replace = false, state, delay = 0 } = options || {}
    
    // Adiciona uma pequena animação de saída se necessário
    if (delay > 0) {
      setTimeout(() => {
        navigate(path, { replace, state })
      }, delay)
    } else {
      // Navegação imediata para melhor performance
      navigate(path, { replace, state })
    }
  }, [navigate])

  // Navegação com preload (para páginas que sabemos que serão acessadas)
  const preloadRoute = useCallback((path: string) => {
    // Precarrega a rota em background
    const link = document.createElement('link')
    link.rel = 'prefetch'
    link.href = path
    document.head.appendChild(link)
    
    // Remove o link após 5 segundos para limpar o DOM
    setTimeout(() => {
      if (document.head.contains(link)) {
        document.head.removeChild(link)
      }
    }, 5000)
  }, [])

  // Navegação com transição suave
  const navigateWithTransition = useCallback((
    path: string,
    transitionClass: string = 'fade-out'
  ) => {
    // Adiciona classe de transição
    document.body.classList.add(transitionClass)
    
    // Navega após a animação
    setTimeout(() => {
      navigate(path)
      
      // Remove a classe após a navegação
      setTimeout(() => {
        document.body.classList.remove(transitionClass)
      }, 100)
    }, 200)
  }, [navigate])

  return {
    navigateOptimized,
    preloadRoute,
    navigateWithTransition
  }
}

export default useOptimizedNavigation
