import { ReactionDTO, ReactionInputDTO } from '../dto'

export interface ReactionService {
  reactToPost: (userId: string, data: ReactionInputDTO) => Promise<ReactionDTO>
  deleteReaction: (userId: string, data: ReactionInputDTO) => Promise<void>
}
