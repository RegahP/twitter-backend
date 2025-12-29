import { ForbiddenException } from '@utils'
import type { FollowerRepository } from '@domains/follower/repository'
import type { ChatMessageDTO, ChatSendMessageInput } from '../dto'
import type { ChatRepository } from '../repository'
import type { ChatService } from './chat.service'

export const createChatRoomId = (userA: string, userB: string): string => {
  const [a, b] = [userA, userB].sort()
  return `dm:${a}:${b}`
}

export class ChatServiceImpl implements ChatService {
  constructor (
    private readonly chatRepository: ChatRepository,
    private readonly followerRepository: FollowerRepository
  ) {}

  private async assertMutualFollow (userId: string, peerUserId: string): Promise<void> {
    if (userId === peerUserId) throw new ForbiddenException()

    const [aFollowsB, bFollowsA] = await Promise.all([
      this.followerRepository.isFollowing({ followerId: userId, followedId: peerUserId }),
      this.followerRepository.isFollowing({ followerId: peerUserId, followedId: userId })
    ])

    if (!aFollowsB || !bFollowsA) throw new ForbiddenException()
  }

  async sendMessage (fromUserId: string, input: ChatSendMessageInput): Promise<ChatMessageDTO> {
    const content = input.content?.trim()
    if (!content) throw new ForbiddenException()

    await this.assertMutualFollow(fromUserId, input.toUserId)

    const roomId = createChatRoomId(fromUserId, input.toUserId)

    return await this.chatRepository.createMessage({
      roomId,
      fromUserId,
      toUserId: input.toUserId,
      content
    })
  }

  async getHistory (userId: string, peerUserId: string, limit?: number): Promise<ChatMessageDTO[]> {
    await this.assertMutualFollow(userId, peerUserId)

    const roomId = createChatRoomId(userId, peerUserId)
    return await this.chatRepository.getRecentMessages(roomId, limit)
  }
}
