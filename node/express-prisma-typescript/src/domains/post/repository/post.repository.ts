import { CursorPagination, OffsetPagination } from '@types'
import { CommentDTO, CreateCommentInputDTO, CreatePostInputDTO, PostDTO } from '../dto'

export interface PostRepository {
  create: (userId: string, data: CreatePostInputDTO) => Promise<PostDTO>
  getAllByDatePaginated: (options: CursorPagination) => Promise<PostDTO[]>
  delete: (postId: string) => Promise<void>
  getById: (postId: string) => Promise<PostDTO | null>
  getByAuthorId: (authorId: string) => Promise<PostDTO[]>
  createComment: (userId: string, data: CreateCommentInputDTO) => Promise<CommentDTO>
  getCommentsByParentId: (parentId: string, options: OffsetPagination) => Promise<CommentDTO[]>
}
