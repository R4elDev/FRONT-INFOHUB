import { forwardRef } from 'react'
import { Button } from '../ui/button'
import { cn } from '../../lib/utils'

interface FormButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline'
  size?: 'default' | 'large'
  loading?: boolean
  children: React.ReactNode
}

const FormButton = forwardRef<HTMLButtonElement, FormButtonProps>(
  ({ variant = 'primary', size = 'default', loading, children, className, disabled, ...props }, ref) => {
    const buttonClasses = cn(
      variant === 'primary' && 'btn-primary',
      variant === 'secondary' && 'btn-secondary',
      variant === 'outline' && 'btn-outline',
      size === 'large' && 'h-[50px] sm:h-[55px] md:h-[60px] text-[16px] sm:text-[18px] md:text-[20px]',
      className
    )

    return (
      <Button
        ref={ref}
        className={buttonClasses}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <div className="flex items-center gap-2">
            <div className="loading-spinner w-4 h-4"></div>
            Carregando...
          </div>
        ) : (
          children
        )}
      </Button>
    )
  }
)

FormButton.displayName = 'FormButton'

export { FormButton }
