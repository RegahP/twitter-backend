import { ReactionRepository } from '../repository'
import { ReactionService } from './reaction.service'
import { ReactionDTO, ReactionInputDTO } from '../dto'
import { ConflictException, NotFoundException } from '@utils'
import { validate } from 'class-validator'
import { PostRepository } from '@domains/post/repository'

export class ReactionServiceImpl implements ReactionService {
  constructor (
    private readonly reactionRepository: ReactionRepository,
    private readonly postRepository: PostRepository
  ) {}

  async reactToPost (userId: string, data: ReactionInputDTO): Promise<ReactionDTO> {
    await validate(data)
    const post = await this.postRepository.getById(data.postId)
    if (!post) throw new NotFoundException('post')
    const reaction = await this.reactionRepository.getReaction(userId, data)
    if (reaction) {
      throw new ConflictException(`${data.type.toUpperCase()}_REACTION_ALREADY_EXISTS`)
    }
    return await this.reactionRepository.react(userId, data)
  }

  async getReaction (userId: string, postId: string, type: 'like' | 'retweet'): Promise<ReactionDTO | null> {
    const post = await this.postRepository.getById(postId)
    if (!post) throw new NotFoundException('post')
    return await this.reactionRepository.getReaction(userId, new ReactionInputDTO({ postId, type }))
  }

  async deleteReaction (userId: string, data: ReactionInputDTO): Promise<void> {
    const post = await this.postRepository.getById(data.postId)
    if (!post) throw new NotFoundException('post')
    const reaction = await this.reactionRepository.getReaction(userId, data)
    if (!reaction) {
      throw new NotFoundException(`${data.type}`)
    }
    await this.reactionRepository.deleteReaction(userId, data)
  }

  async countLikes (postId: string): Promise<number> {
    return await this.reactionRepository.countLikes(postId)
  }

  async countRetweets (postId: string): Promise<number> {
    return await this.reactionRepository.countRetweets(postId)
  }

  async countReactionsByPostIds (postIds: string[]): Promise<{ likes: Record<string, number>, retweets: Record<string, number> }> {
    return await this.reactionRepository.countReactionsByPostIds(postIds)
  }
}
