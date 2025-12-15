import { CursorPagination } from '@types'
import { CreatePostInputDTO, PostDTO, ReactionDTO, ReactionInputDTO } from '../dto'

export interface PostRepository {
  create: (userId: string, data: CreatePostInputDTO) => Promise<PostDTO>
  getAllByDatePaginated: (options: CursorPagination) => Promise<PostDTO[]>
  delete: (postId: string) => Promise<void>
  getById: (postId: string) => Promise<PostDTO | null>
  getByAuthorId: (authorId: string) => Promise<PostDTO[]>
  react: (userId: string, data: ReactionInputDTO) => Promise<ReactionDTO>
  deleteReaction: (userId: string, data: ReactionInputDTO) => Promise<void>
  getReaction: (userId: string, data: ReactionInputDTO) => Promise<ReactionDTO | null>
}
