interface PriceDisplayProps {
  price: number
  oldPrice?: number
  discount?: number
  size?: 'sm' | 'md' | 'lg'
}

export default function PriceDisplay({
  price,
  oldPrice,
  discount,
  size = 'md'
}: PriceDisplayProps) {
  const priceSize = {
    sm: 'text-base',
    md: 'text-lg',
    lg: 'text-2xl'
  }

  const oldPriceSize = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  }

  return (
    <div>
      {oldPrice && discount && (
        <div className="flex items-center gap-2 mb-1">
          <span className="bg-gradient-to-r from-orange-100 to-orange-50 text-orange-700 font-bold px-2 py-1 rounded-md text-xs">
            -{discount}%
          </span>
          <span className={`text-gray-400 line-through ${oldPriceSize[size]}`}>
            R$ {oldPrice.toFixed(2)}
          </span>
        </div>
      )}
      <p className={`text-green-700 font-bold ${priceSize[size]}`}>
        R$ {price.toFixed(2)}
      </p>
    </div>
  )
}
