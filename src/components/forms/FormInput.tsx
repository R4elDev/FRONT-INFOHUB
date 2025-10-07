import { forwardRef } from 'react'
import { Input } from '../ui/input'
import { cn } from '../../lib/utils'

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  touched?: boolean
  variant?: 'default' | 'large'
}

const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
  ({ label, error, touched, variant = 'default', className, ...props }, ref) => {
    const hasError = touched && error

    const inputClasses = cn(
      'form-input-base',
      hasError && 'form-input-error',
      variant === 'large' && 'form-input-large',
      className
    )

    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        
        <Input
          ref={ref}
          className={inputClasses}
          {...props}
        />
        
        {hasError && (
          <p className="error-text">
            ❌ {error}
          </p>
        )}
      </div>
    )
  }
)

FormInput.displayName = 'FormInput'

export { FormInput }
