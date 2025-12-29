import type { PrismaClient } from '@prisma/client'
import type { ChatMessageDTO } from '../dto'

export interface CreateChatMessageData {
  roomId: string
  fromUserId: string
  toUserId: string
  content: string
}

export interface ChatRepository {
  createMessage: (data: CreateChatMessageData) => Promise<ChatMessageDTO>
  getRecentMessages: (roomId: string, limit?: number) => Promise<ChatMessageDTO[]>
}

export interface ChatRepositoryDeps {
  db: PrismaClient
}
