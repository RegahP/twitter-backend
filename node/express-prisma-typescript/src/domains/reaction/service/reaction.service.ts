import { ReactionDTO, ReactionInputDTO } from '../dto'

export interface ReactionService {
  reactToPost: (userId: string, data: ReactionInputDTO) => Promise<ReactionDTO>
  getReaction: (userId: string, postId: string, type: 'like' | 'retweet') => Promise<ReactionDTO | null>
  deleteReaction: (userId: string, data: ReactionInputDTO) => Promise<void>
  countLikes: (postId: string) => Promise<number>
  countRetweets: (postId: string) => Promise<number>
  countReactionsByPostIds: (postIds: string[]) => Promise<{ likes: Record<string, number>, retweets: Record<string, number> }>
}
