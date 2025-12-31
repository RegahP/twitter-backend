import { ReactionDTO, ReactionInputDTO } from '../dto'

export interface ReactionRepository {
  react: (userId: string, data: ReactionInputDTO) => Promise<ReactionDTO>
  deleteReaction: (userId: string, data: ReactionInputDTO) => Promise<void>
  getReaction: (userId: string, data: ReactionInputDTO) => Promise<ReactionDTO | null>
  countLikes: (postId: string) => Promise<number>
  countRetweets: (postId: string) => Promise<number>
  countReactionsByPostIds: (postIds: string[]) => Promise<{ likes: Record<string, number>, retweets: Record<string, number> }>
}
