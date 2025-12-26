import { PostServiceImpl } from '@domains/post/service'
import { PostRepository } from '@domains/post/repository'
import { CreateCommentInputDTO, CreatePostInputDTO, PostDTO } from '@domains/post/dto'
import { UserService } from '@domains/user/service'
import { FollowerService } from '@domains/follower/service'
import { OffsetPagination } from '@types'

describe('PostServiceImpl', () => {
  let repository: jest.Mocked<PostRepository>
  let userService: jest.Mocked<UserService>
  let followerService: jest.Mocked<FollowerService>
  let service: PostServiceImpl

  beforeAll(() => {
    repository = {
      create: jest.fn(),
      getAllByDatePaginated: jest.fn(),
      getAllFollowedByDatePaginated: jest.fn(),
      delete: jest.fn(),
      getById: jest.fn(),
      getByAuthorId: jest.fn(),
      createComment: jest.fn(),
      countCommentsByRootId: jest.fn(),
      countCommentsByParentId: jest.fn(),
      getCommentsByParentId: jest.fn()
    }

    userService = {
      deleteUser: jest.fn(),
      getUser: jest.fn(),
      getUserRecommendations: jest.fn(),
      isPublicProfile: jest.fn(),
      setProfileImageKey: jest.fn()
    }

    followerService = {
      followUser: jest.fn(),
      unfollowUser: jest.fn(),
      isFollowing: jest.fn(),
      getFollowers: jest.fn(),
      getFollowing: jest.fn()
    }

    service = new PostServiceImpl(repository, userService, followerService)
  })

  describe('createPost', () => {
    it('should create a post', async () => {
      const userId = 'user-1'
      const body = new CreatePostInputDTO()
      body.content = 'hello'

      const created: PostDTO = {
        id: 'post-1',
        authorId: userId,
        content: body.content,
        images: [],
        createdAt: new Date()
      }

      repository.create.mockResolvedValue(created)

      const result = await service.createPost(userId, body)

      expect(result).toEqual(created)
      expect(repository.create).toHaveBeenCalledWith(userId, body)
    })
  })

  describe('deletePost', () => {
    it('should delete a post when requester is author', async () => {
      const userId = 'user-1'
      const postId = 'post-1'
      const post: PostDTO = {
        id: postId,
        authorId: userId,
        content: 'hello',
        images: [],
        createdAt: new Date()
      }

      repository.getById.mockResolvedValue(post)
      repository.delete.mockResolvedValue(undefined)

      await service.deletePost(userId, postId)

      expect(repository.getById).toHaveBeenCalledWith(postId)
      expect(repository.delete).toHaveBeenCalledWith(postId)
    })
  })

  describe('getPost', () => {
    it('should return a post when following author', async () => {
      const userId = 'user-1'
      const postId = 'post-1'
      const post: PostDTO = {
        id: postId,
        authorId: 'author-1',
        content: 'hello',
        images: [],
        createdAt: new Date()
      }

      repository.getById.mockResolvedValue(post)
      followerService.isFollowing.mockResolvedValue(true)

      const result = await service.getPost(userId, postId)

      expect(result).toEqual(post)
      expect(repository.getById).toHaveBeenCalledWith(postId)
      expect(followerService.isFollowing).toHaveBeenCalledWith({ followerId: userId, followedId: post.authorId })
      expect(userService.isPublicProfile).not.toHaveBeenCalled()
    })

    it('should return a post when author is public (not following)', async () => {
      const userId = 'user-1'
      const postId = 'post-1'
      const post: PostDTO = {
        id: postId,
        authorId: 'author-1',
        content: 'hello',
        images: [],
        createdAt: new Date()
      }

      repository.getById.mockResolvedValue(post)
      followerService.isFollowing.mockResolvedValue(false)
      userService.isPublicProfile.mockResolvedValue(true)

      const result = await service.getPost(userId, postId)

      expect(result).toEqual(post)
      expect(followerService.isFollowing).toHaveBeenCalledWith({ followerId: userId, followedId: post.authorId })
      expect(userService.isPublicProfile).toHaveBeenCalledWith(post.authorId)
    })
  })

  describe('getLatestPosts', () => {
    it('should return latest followed posts', async () => {
      const userId = 'user-1'
      const options = { limit: 10 }

      const posts: PostDTO[] = [
        { id: 'p1', authorId: 'a1', content: 'c1', images: [], createdAt: new Date() },
        { id: 'p2', authorId: 'a2', content: 'c2', images: [], createdAt: new Date() },
        { id: 'p3', authorId: 'a3', content: 'c3', images: [], createdAt: new Date() }
      ]

      repository.getAllFollowedByDatePaginated.mockResolvedValue([posts[1]])
      const result = await service.getLatestPosts(userId, options)

      expect(result).toEqual([posts[1]])
      expect(repository.getAllFollowedByDatePaginated).toHaveBeenCalledWith(userId, options)
    })
  })

  describe('getPostsByAuthor', () => {
    it('should return posts by author when following', async () => {
      const userId = 'user-1'
      const authorId = 'author-1'
      const posts: PostDTO[] = [{ id: 'p1', authorId, content: 'c1', images: [], createdAt: new Date() }]

      followerService.isFollowing.mockResolvedValue(true)
      repository.getByAuthorId.mockResolvedValue(posts)

      const result = await service.getPostsByAuthor(userId, authorId)

      expect(result).toEqual(posts)
      expect(followerService.isFollowing).toHaveBeenCalledWith({ followerId: userId, followedId: authorId })
      expect(repository.getByAuthorId).toHaveBeenCalledWith(authorId)
    })
  })

  describe('createComment', () => {
    it('should create a comment when parent post exists', async () => {
      const userId = 'user-1'
      const parentId = 'post-1'

      const parentPost: PostDTO = {
        id: parentId,
        authorId: 'author-1',
        content: 'parent',
        images: [],
        createdAt: new Date()
      }

      const data = new CreateCommentInputDTO({ parentId, content: 'comment' } as any)
      const created = {
        id: 'comment-1',
        parentId,
        authorId: userId,
        content: data.content,
        images: [],
        createdAt: new Date()
      }

      repository.getById.mockResolvedValue(parentPost)
      repository.createComment.mockResolvedValue(created as any)

      const result = await service.createComment(userId, data)

      expect(result).toEqual(created)
      expect(repository.getById).toHaveBeenCalledWith(parentId)
      expect(repository.createComment).toHaveBeenCalledWith(userId, data)
    })
  })

  describe('getComments', () => {
    it('should return comments for a post', async () => {
      const postId = 'post-1'
      const options: OffsetPagination = { limit: 10, skip: 0 }
      const parentPost: PostDTO = {
        id: postId,
        authorId: 'author-1',
        content: 'parent',
        images: [],
        createdAt: new Date()
      }

      const comments = [
        { id: 'c1', parentId: postId, authorId: 'u1', content: 'a', images: [], createdAt: new Date() }
      ]

      repository.getById.mockResolvedValue(parentPost)
      repository.getCommentsByParentId.mockResolvedValue(comments as any)

      const result = await service.getComments(postId, options)

      expect(result).toEqual(comments)
      expect(repository.getById).toHaveBeenCalledWith(postId)
      expect(repository.getCommentsByParentId).toHaveBeenCalledWith(postId, options)
    })
  })
})
