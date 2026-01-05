import { ChatServiceImpl, createChatRoomId } from '@domains/chat/service'
import type { ChatRepository } from '@domains/chat/repository'
import type { FollowerRepository } from '@domains/follower/repository'
import { ChatMessageDTO, type ChatSendMessageInput } from '@domains/chat/dto'
import { ForbiddenException } from '../../../../utils/errors'

describe('ChatServiceImpl', () => {
  let chatRepository: jest.Mocked<ChatRepository>
  let followerRepository: jest.Mocked<FollowerRepository>
  let service: ChatServiceImpl

  beforeAll(() => {
    chatRepository = {
      createMessage: jest.fn(),
      getRecentMessages: jest.fn()
    }

    followerRepository = {
      followUser: jest.fn(),
      unfollowUser: jest.fn(),
      isFollowing: jest.fn(),
      getFollowers: jest.fn(),
      getFollowing: jest.fn()
    }

    service = new ChatServiceImpl(chatRepository, followerRepository)
  })

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('createChatRoomId should be deterministic', () => {
    expect(createChatRoomId('u2', 'u1')).toBe('dm:u1:u2')
  })

  describe('sendMessage', () => {
    it('should throw ForbiddenException for blank content', async () => {
      const input: ChatSendMessageInput = { toUserId: 'u2', content: '   ' }

      await expect(service.sendMessage('u1', input)).rejects.toThrow(ForbiddenException)
      expect(followerRepository.isFollowing).not.toHaveBeenCalled()
      expect(chatRepository.createMessage).not.toHaveBeenCalled()
    })

    it('should throw ForbiddenException when messaging self', async () => {
      const input: ChatSendMessageInput = { toUserId: 'u1', content: 'hello' }

      await expect(service.sendMessage('u1', input)).rejects.toThrow(ForbiddenException)
      expect(chatRepository.createMessage).not.toHaveBeenCalled()
    })

    it('should throw ForbiddenException when not mutually following', async () => {
      const input: ChatSendMessageInput = { toUserId: 'u2', content: 'hello' }

      followerRepository.isFollowing.mockResolvedValueOnce(true).mockResolvedValueOnce(false)

      await expect(service.sendMessage('u1', input)).rejects.toThrow(ForbiddenException)
      expect(chatRepository.createMessage).not.toHaveBeenCalled()
    })

    it('should create a message when mutually following', async () => {
      const input: ChatSendMessageInput = { toUserId: 'u2', content: ' hello ' }

      followerRepository.isFollowing.mockResolvedValue(true)

      const createdAt = new Date()
      const dto = new ChatMessageDTO({
        id: 'm1',
        roomId: 'dm:u1:u2',
        fromUserId: 'u1',
        toUserId: 'u2',
        content: 'hello',
        createdAt
      })

      chatRepository.createMessage.mockResolvedValue(dto)

      const result = await service.sendMessage('u1', input)

      expect(followerRepository.isFollowing).toHaveBeenNthCalledWith(1, { followerId: 'u1', followedId: 'u2' })
      expect(followerRepository.isFollowing).toHaveBeenNthCalledWith(2, { followerId: 'u2', followedId: 'u1' })

      expect(chatRepository.createMessage).toHaveBeenCalledWith({
        roomId: 'dm:u1:u2',
        fromUserId: 'u1',
        toUserId: 'u2',
        content: 'hello'
      })

      expect(result).toBe(dto)
    })
  })

  describe('getHistory', () => {
    it('should return history when mutually following', async () => {
      followerRepository.isFollowing.mockResolvedValue(true)

      const createdAt = new Date()
      const history = [
        new ChatMessageDTO({
          id: 'm1',
          roomId: 'dm:u1:u2',
          fromUserId: 'u1',
          toUserId: 'u2',
          content: 'hi',
          createdAt
        })
      ]

      chatRepository.getRecentMessages.mockResolvedValue(history)

      const result = await service.getHistory('u1', 'u2', 10)

      expect(chatRepository.getRecentMessages).toHaveBeenCalledWith('dm:u1:u2', 10)
      expect(result).toEqual(history)
    })

    it('should throw ForbiddenException when not mutually following', async () => {
      followerRepository.isFollowing.mockResolvedValueOnce(false).mockResolvedValueOnce(true)

      await expect(service.getHistory('u1', 'u2', 10)).rejects.toThrow(ForbiddenException)
      expect(chatRepository.getRecentMessages).not.toHaveBeenCalled()
    })
  })
})
