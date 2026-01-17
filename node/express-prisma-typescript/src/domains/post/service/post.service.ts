import { CommentDTO, CreateCommentInputDTO, CreatePostInputDTO, ExtendedCommentDTO, ExtendedPostDTO, PostDTO } from '../dto'
import { OffsetPagination } from '@types'

export interface PostService {
  createPost: (userId: string, body: CreatePostInputDTO) => Promise<PostDTO>
  deletePost: (userId: string, postId: string) => Promise<void>
  getPost: (userId: string, postId: string) => Promise<ExtendedPostDTO>
  getLatestPosts: (userId: string, self: boolean, options: { limit?: number, before?: string, after?: string }) => Promise<ExtendedPostDTO[]>
  getPostsByAuthor: (userId: any, authorId: string) => Promise<ExtendedPostDTO[]>
  createComment: (userId: string, data: CreateCommentInputDTO) => Promise<CommentDTO>
  getComments: (postId: string, options: OffsetPagination) => Promise<ExtendedCommentDTO[]>
  countCommentsByRootId: (rootId: string) => Promise<number>
  countCommentsByParentId: (parentId: string) => Promise<number>
  getCommentRootId: (postId: string) => Promise<string>
}
