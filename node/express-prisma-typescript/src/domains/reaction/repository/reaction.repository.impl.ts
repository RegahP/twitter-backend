import { PrismaClient } from '@prisma/client'
import { ReactionRepository } from '.'
import { ReactionDTO, ReactionInputDTO } from '../dto'

export class ReactionRepositoryImpl implements ReactionRepository {
  constructor (private readonly db: PrismaClient) {}

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

  async countLikes (postId: string): Promise<number> {
    const count = await this.db.reaction.count({
      where: {
        postId,
        type: 'like'
      }
    })
    return count
  }

  async countRetweets (postId: string): Promise<number> {
    const count = await this.db.reaction.count({
      where: {
        postId,
        type: 'retweet'
      }
    })
    return count
  }

  async countReactionsByPostIds (postIds: string[]): Promise<{ likes: Record<string, number>, retweets: Record<string, number> }> {
    if (postIds.length === 0) return { likes: {}, retweets: {} }

    const grouped = await this.db.reaction.groupBy({
      by: ['postId', 'type'],
      where: {
        postId: { in: postIds },
        type: { in: ['like', 'retweet'] }
      },
      _count: { _all: true }
    })

    const likes: Record<string, number> = {}
    const retweets: Record<string, number> = {}

    for (const row of grouped) {
      if (row.type === 'like') likes[row.postId] = row._count._all
      if (row.type === 'retweet') retweets[row.postId] = row._count._all
    }

    return { likes, retweets }
  }
}
