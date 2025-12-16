import { PrismaClient } from 'generated/prisma/client'
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
}
