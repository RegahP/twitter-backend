import { PrismaClient, Post } from '@prisma/client'
import { CursorPagination, OffsetPagination } from '@types'
import { PostRepository } from '.'
import { CreateCommentInputDTO, CommentDTO, CreatePostInputDTO, PostDTO } from '../dto'

export class PostRepositoryImpl implements PostRepository {
  constructor (private readonly db: PrismaClient) {}

  async create (userId: string, data: CreatePostInputDTO): Promise<PostDTO> {
    const post = await this.db.post.create({
      data: {
        authorId: userId,
        ...data
      }
    })
    return new PostDTO(post)
  }

  async getAllByDatePaginated (options: CursorPagination): Promise<PostDTO[]> {
    const posts: Post[] = await this.db.post.findMany({
      where: {
        parentId: null
      },
      cursor: options.after ? { id: options.after } : (options.before) ? { id: options.before } : undefined,
      skip: options.after ?? options.before ? 1 : undefined,
      take: options.limit ? (options.before ? -options.limit : options.limit) : undefined,
      orderBy: [
        {
          createdAt: 'desc'
        },
        {
          id: 'asc'
        }
      ]
    })
    return posts.map(post => new PostDTO(post))
  }

  async getAllFollowedByDatePaginated (userId: string, options: CursorPagination): Promise<PostDTO[]> {
    const posts: Post[] = await this.db.post.findMany({
      where: {
        parentId: null,
        author: {
          followers: {
            some: {
              followerId: userId
            }
          }
        }
      },
      cursor: options.after ? { id: options.after } : (options.before) ? { id: options.before } : undefined,
      skip: options.after ?? options.before ? 1 : undefined,
      take: options.limit ? (options.before ? -options.limit : options.limit) : undefined,
      orderBy: [
        {
          createdAt: 'desc'
        },
        {
          id: 'asc'
        }
      ]
    })
    return posts.map(post => new PostDTO(post))
  }

  async delete (postId: string): Promise<void> {
    await this.db.post.delete({
      where: {
        id: postId
      }
    })
  }

  async getById (postId: string): Promise<PostDTO | CommentDTO | null> {
    const post: Post | null = await this.db.post.findUnique({
      where: {
        id: postId
      }
    })
    if (post == null) return null
    return post.parentId == null ? new PostDTO(post) : new CommentDTO(post)
  }

  async getByAuthorId (authorId: string): Promise<PostDTO[]> {
    const posts: Post[] = await this.db.post.findMany({
      where: {
        authorId
      }
    })
    return posts.map(post => new PostDTO(post))
  }

  async createComment (userId: string, data: CreateCommentInputDTO): Promise<CommentDTO> {
    const comment = await this.db.post.create({
      data: {
        authorId: userId,
        ...data
      }
    })
    return new CommentDTO(comment)
  }

  async countCommentsByRootId (rootId: string): Promise<number> {
    return await this.db.post.count({
      where: {
        rootId,
        parentId: { not: null }
      }
    })
  }

  async countCommentsByRootIds (rootIds: string[]): Promise<Record<string, number>> {
    if (rootIds.length === 0) return {}

    const grouped = await this.db.post.groupBy({
      by: ['rootId'],
      where: {
        rootId: { in: rootIds },
        parentId: { not: null }
      },
      _count: { _all: true }
    })

    const counts: Record<string, number> = {}
    for (const row of grouped) {
      if (row.rootId != null) counts[row.rootId] = row._count._all
    }
    return counts
  }

  async countCommentsByParentId (parentId: string): Promise<number> {
    return await this.db.post.count({
      where: {
        parentId
      }
    })
  }

  async getCommentsByParentId (parentId: string, options: OffsetPagination): Promise<CommentDTO[]> {
    const comments: Post[] = await this.db.post.findMany({
      where: {
        parentId
      },
      take: options.limit ?? 10,
      skip: options.skip ?? 0,
      orderBy: [
        { createdAt: 'asc' },
        { id: 'asc' }
      ]
    })
    return comments.map(comment => new CommentDTO(comment))
  }
}
