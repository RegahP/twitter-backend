import { CursorPagination, OffsetPagination } from '@types'
import { CommentDTO, CreateCommentInputDTO, CreatePostInputDTO, PostDTO } from '../dto'

export interface PostRepository {
  create: (userId: string, data: CreatePostInputDTO) => Promise<PostDTO>
  getAllByDatePaginated: (options: CursorPagination) => Promise<PostDTO[]>
  getAllFollowedByDatePaginated: (userId: string, options: CursorPagination) => Promise<PostDTO[]>
  delete: (postId: string) => Promise<void>
  getById: (postId: string) => Promise<PostDTO | CommentDTO | null>
  getByAuthorId: (authorId: string) => Promise<PostDTO[]>
  createComment: (userId: string, data: CreateCommentInputDTO) => Promise<CommentDTO>
  countCommentsByRootId: (rootId: string) => Promise<number>
  countCommentsByParentId: (parentId: string) => Promise<number>
  getCommentsByParentId: (parentId: string, options: OffsetPagination) => Promise<CommentDTO[]>
}
