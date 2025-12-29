import type { ChatMessageDTO, ChatSendMessageInput } from '../dto'

export interface ChatService {
  sendMessage: (fromUserId: string, input: ChatSendMessageInput) => Promise<ChatMessageDTO>
  getHistory: (userId: string, peerUserId: string, limit?: number) => Promise<ChatMessageDTO[]>
}
