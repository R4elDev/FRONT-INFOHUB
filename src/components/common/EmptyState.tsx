import { Button } from "../ui/button"

interface EmptyStateProps {
  icon: string
  title: string
  description: string
  actionText?: string
  onAction?: () => void
}

export default function EmptyState({
  icon,
  title,
  description,
  actionText,
  onAction
}: EmptyStateProps) {
  return (
    <div className="text-center py-20 animate-fadeInUp">
      <div className="text-6xl mb-4">{icon}</div>
      <h2 className="text-2xl font-semibold text-gray-700 mb-2">
        {title}
      </h2>
      <p className="text-gray-500 mb-6">
        {description}
      </p>
      {actionText && onAction && (
        <Button
          onClick={onAction}
          className="bg-[#F9A01B] hover:bg-[#e89015] text-white px-8 py-3 rounded-full"
        >
          {actionText}
        </Button>
      )}
    </div>
  )
}
