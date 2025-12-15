import { PrismaClient, Post } from 'generated/prisma/client'
import { CursorPagination } from '@types'
import { PostRepository } from '.'
import { CreatePostInputDTO, PostDTO, ReactionDTO, ReactionInputDTO } from '../dto'

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

  async getById (postId: string): Promise<PostDTO | null> {
    const post: Post | null = await this.db.post.findUnique({
      where: {
        id: postId
      }
    })
    return (post != null) ? new PostDTO(post) : null
  }

  async getByAuthorId (authorId: string): Promise<PostDTO[]> {
    const posts: Post[] = await this.db.post.findMany({
      where: {
        authorId
      }
    })
    return posts.map(post => new PostDTO(post))
  }

  async react (userId: string, data: ReactionInputDTO): Promise<ReactionDTO> {
    const reaction = await this.db.reaction.create({
      data: {
        userId,
        postId: data.postId,
        type: data.type
      }
    })
    return new ReactionDTO({ ...reaction, type: reaction.type as 'like' | 'retweet' })
  }

  async deleteReaction (userId: string, data: ReactionInputDTO): Promise<void> {
    await this.db.reaction.delete({
      where: {
        userId_postId_type: {
          userId,
          postId: data.postId,
          type: data.type
        }
      }
    })
  }

  async getReaction (userId: string, data: ReactionInputDTO): Promise<ReactionDTO | null> {
    const reaction = await this.db.reaction.findUnique({
      where: {
        userId_postId_type: {
          userId,
          postId: data.postId,
          type: data.type
        }
      }
    })
    return (reaction != null) ? new ReactionDTO({ ...reaction, type: reaction.type as 'like' | 'retweet' }) : null
  }
}
