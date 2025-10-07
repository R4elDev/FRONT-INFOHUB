export interface Comment {
  id: number
  author: string
  authorAvatar?: string
  title: string
  body: string
  rating: number
  likes: number
  createdAt: string
}

export interface CommentCardProps extends Comment {
  onLike?: (id: number) => void
  onComment?: (id: number) => void
}
