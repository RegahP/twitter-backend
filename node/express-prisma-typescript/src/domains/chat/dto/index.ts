import type { ChatMessage } from '@prisma/client'

export class ChatMessageDTO {
  constructor (msg: Pick<ChatMessage, 'id' | 'roomId' | 'fromUserId' | 'toUserId' | 'content' | 'createdAt'>) {
    this.id = msg.id
    this.roomId = msg.roomId
    this.fromUserId = msg.fromUserId
    this.toUserId = msg.toUserId
    this.content = msg.content
    this.createdAt = msg.createdAt
  }

  id: string
  roomId: string
  fromUserId: string
  toUserId: string
  content: string
  createdAt: Date
}

export interface ChatJoinInput {
  peerUserId: string
  limit?: number
}

export interface ChatSendMessageInput {
  toUserId: string
  content: string
}
