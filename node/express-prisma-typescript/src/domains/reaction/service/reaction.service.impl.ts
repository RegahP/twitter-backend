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

  async deleteReaction (userId: string, data: ReactionInputDTO): Promise<void> {
    const post = await this.postRepository.getById(data.postId)
    if (!post) throw new NotFoundException('post')
    const reaction = await this.reactionRepository.getReaction(userId, data)
    if (!reaction) {
      throw new NotFoundException(`${data.type}`)
    }
    await this.reactionRepository.deleteReaction(userId, data)
  }
}
