import { FollowerServiceImpl } from '@domains/follower/service'
import { FollowerRepository } from '@domains/follower/repository'
import { FollowInputDTO, FollowDTO } from '@domains/follower/dto'
import { ForbiddenException, ConflictException } from '@utils'
import { OffsetPagination } from '@types'

describe('FollowerServiceImpl', () => {
  let repository: jest.Mocked<FollowerRepository>
  let service: FollowerServiceImpl

  beforeEach(() => {
    // Mock the repository
    repository = {
      followUser: jest.fn(),
      unfollowUser: jest.fn(),
      isFollowing: jest.fn(),
      getFollowers: jest.fn(),
      getFollowing: jest.fn()
    }

    // Inject the mocked repository
    service = new FollowerServiceImpl(repository)
  })

  describe('followUser', () => {
    it('should throw ForbiddenException when user tries to follow themselves', async () => {
      const data: FollowInputDTO = {
        followerId: 'user-1',
        followedId: 'user-1'
      }

      await expect(service.followUser(data)).rejects.toThrow(ForbiddenException)
      expect(repository.followUser).not.toHaveBeenCalled()
    })

    it('should throw ConflictException when already following', async () => {
      const data: FollowInputDTO = {
        followerId: 'user-1',
        followedId: 'user-2'
      }

      repository.isFollowing.mockResolvedValue(true)

      await expect(service.followUser(data)).rejects.toThrow(ConflictException)
      expect(repository.followUser).not.toHaveBeenCalled()
    })

    it('should successfully follow a user', async () => {
      const data: FollowInputDTO = {
        followerId: 'user-1',
        followedId: 'user-2'
      }
      const followDTO: FollowDTO = {
        id: 'follow-1',
        followerId: 'user-1',
        followedId: 'user-2',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null
      }

      repository.isFollowing.mockResolvedValue(false)
      repository.followUser.mockResolvedValue(followDTO)

      const result = await service.followUser(data)

      expect(result).toEqual(followDTO)
      expect(repository.isFollowing).toHaveBeenCalledWith(data)
      expect(repository.followUser).toHaveBeenCalledWith(data)
    })
  })

  describe('isFollowing', () => {
    it('should return true when user is following', async () => {
      const data: FollowInputDTO = {
        followerId: 'user-1',
        followedId: 'user-2'
      }

      repository.isFollowing.mockResolvedValue(true)

      const result = await service.isFollowing(data)

      expect(result).toBe(true)
      expect(repository.isFollowing).toHaveBeenCalledWith(data)
    })

    it('should return false when user is not following', async () => {
      const data: FollowInputDTO = {
        followerId: 'user-1',
        followedId: 'user-2'
      }

      repository.isFollowing.mockResolvedValue(false)

      const result = await service.isFollowing(data)

      expect(result).toBe(false)
      expect(repository.isFollowing).toHaveBeenCalledWith(data)
    })
  })

  describe('getFollowing', () => {
    it('should return list of following users', async () => {
      const userId = 'user-1'
      const options: OffsetPagination = { limit: 10, skip: 0 }
      const followingIds = ['user-2', 'user-3', 'user-4']

      repository.getFollowing.mockResolvedValue(followingIds)

      const result = await service.getFollowing(userId, options)

      expect(result).toEqual(followingIds)
      expect(repository.getFollowing).toHaveBeenCalledWith(userId, options)
    })
  })

  describe('getFollowers', () => {
    it('should return list of followers', async () => {
      const userId = 'user-1'
      const options: OffsetPagination = { limit: 10, skip: 0 }
      const followerIds = ['user-5', 'user-6']

      repository.getFollowers.mockResolvedValue(followerIds)

      const result = await service.getFollowers(userId, options)

      expect(result).toEqual(followerIds)
      expect(repository.getFollowers).toHaveBeenCalledWith(userId, options)
    })
  })
})
