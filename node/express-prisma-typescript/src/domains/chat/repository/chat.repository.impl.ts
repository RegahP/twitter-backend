import type { PrismaClient } from '@prisma/client'
import { ChatMessageDTO } from '../dto'
import type { ChatRepository, CreateChatMessageData } from './chat.repository'

export class ChatRepositoryImpl implements ChatRepository {
  constructor (private readonly db: PrismaClient) {}

  async createMessage (data: CreateChatMessageData): Promise<ChatMessageDTO> {
    const msg = await this.db.chatMessage.create({ data })
    return new ChatMessageDTO(msg)
  }

  async getRecentMessages (roomId: string, limit: number = 50): Promise<ChatMessageDTO[]> {
    const msgs = await this.db.chatMessage.findMany({
      where: { roomId },
      take: Math.min(Math.max(limit, 1), 200),
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }]
    })

    return msgs.reverse().map(m => new ChatMessageDTO(m))
  }
}
