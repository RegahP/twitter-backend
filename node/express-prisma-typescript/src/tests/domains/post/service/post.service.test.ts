import { PostServiceImpl } from '@domains/post/service'
import { PostRepository } from '@domains/post/repository'
import { CommentDTO, CreateCommentInputDTO, CreatePostInputDTO, PostDTO } from '@domains/post/dto'
import { UserService } from '@domains/user/service'
import { FollowerService } from '@domains/follower/service'
import { ReactionService } from '@domains/reaction/service'
import { OffsetPagination } from '@types'

describe('PostServiceImpl', () => {
  let repository: jest.Mocked<PostRepository>
  let userService: jest.Mocked<UserService>
  let followerService: jest.Mocked<FollowerService>
  let reactionService: jest.Mocked<ReactionService>
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
      countCommentsByRootIds: jest.fn(),
      countCommentsByParentId: jest.fn(),
      getCommentsByParentId: jest.fn()
    }

    userService = {
      deleteUser: jest.fn(),
      getUser: jest.fn(),
      getUserRecommendations: jest.fn(),
      getUserExtended: jest.fn(),
      getUsersExtended: jest.fn(),
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

    reactionService = {
      reactToPost: jest.fn(),
      getReaction: jest.fn(),
      deleteReaction: jest.fn(),
      countLikes: jest.fn(),
      countRetweets: jest.fn(),
      countReactionsByPostIds: jest.fn()
    }

    service = new PostServiceImpl(repository, userService, followerService, reactionService)
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
      userService.getUserExtended.mockResolvedValue({ id: 'author-1' } as any)
      repository.countCommentsByRootIds.mockResolvedValue({ [postId]: 7 })
      reactionService.countReactionsByPostIds.mockResolvedValue({ likes: { [postId]: 3 }, retweets: { [postId]: 1 } })

      const result = await service.getPost(userId, postId)

      expect(result).toMatchObject({
        id: postId,
        authorId: 'author-1',
        qtyComments: 7,
        qtyLikes: 3,
        qtyRetweets: 1
      })
      expect(repository.getById).toHaveBeenCalledWith(postId)
      expect(followerService.isFollowing).toHaveBeenCalledWith({ followerId: userId, followedId: post.authorId })
      expect(userService.isPublicProfile).not.toHaveBeenCalled()
      expect(userService.getUserExtended).toHaveBeenCalledWith('author-1')
      expect(repository.countCommentsByRootIds).toHaveBeenCalledWith([postId])
      expect(reactionService.countReactionsByPostIds).toHaveBeenCalledWith([postId])
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
      userService.getUserExtended.mockResolvedValue({ id: 'author-1' } as any)
      repository.countCommentsByRootIds.mockResolvedValue({ [postId]: 0 })
      reactionService.countReactionsByPostIds.mockResolvedValue({ likes: { [postId]: 0 }, retweets: { [postId]: 0 } })

      const result = await service.getPost(userId, postId)

      expect(result).toMatchObject({
        id: postId,
        authorId: 'author-1',
        qtyComments: 0,
        qtyLikes: 0,
        qtyRetweets: 0
      })
      expect(followerService.isFollowing).toHaveBeenCalledWith({ followerId: userId, followedId: post.authorId })
      expect(userService.isPublicProfile).toHaveBeenCalledWith(post.authorId)
      expect(userService.getUserExtended).toHaveBeenCalledWith('author-1')
      expect(repository.countCommentsByRootIds).toHaveBeenCalledWith([postId])
      expect(reactionService.countReactionsByPostIds).toHaveBeenCalledWith([postId])
    })
  })

  describe('getLatestPosts', () => {
    it('should return latest followed posts', async () => {
      const userId = 'user-1'
      const self = false
      const options = { limit: 10 }

      const post: PostDTO = { id: 'p2', authorId: 'a2', content: 'c2', images: [], createdAt: new Date() }

      repository.getAllFollowedByDatePaginated.mockResolvedValue([post])
      userService.getUsersExtended.mockResolvedValue([{ id: 'a2' } as any])
      repository.countCommentsByRootIds.mockResolvedValue({ p2: 7 })
      reactionService.countReactionsByPostIds.mockResolvedValue({ likes: { p2: 3 }, retweets: { p2: 1 } })

      const result = await service.getLatestPosts(userId, self, options)

      expect(repository.getAllFollowedByDatePaginated).toHaveBeenCalledWith(userId, self, options)
      expect(userService.getUsersExtended).toHaveBeenCalledWith(['a2'])
      expect(repository.countCommentsByRootIds).toHaveBeenCalledWith(['p2'])
      expect(reactionService.countReactionsByPostIds).toHaveBeenCalledWith(['p2'])

      expect(result).toHaveLength(1)
      expect(result[0]).toMatchObject({
        id: 'p2',
        authorId: 'a2',
        qtyComments: 7,
        qtyLikes: 3,
        qtyRetweets: 1
      })
    })
  })

  describe('getPostsByAuthor', () => {
    it('should return posts by author when following', async () => {
      const userId = 'user-1'
      const authorId = 'author-1'
      const posts: PostDTO[] = [{ id: 'p1', authorId, content: 'c1', images: [], createdAt: new Date() }]

      followerService.isFollowing.mockResolvedValue(true)
      repository.getByAuthorId.mockResolvedValue(posts)

      userService.getUserExtended.mockResolvedValue({ id: authorId } as any)
      repository.countCommentsByRootIds.mockResolvedValue({ p1: 2 })
      reactionService.countReactionsByPostIds.mockResolvedValue({ likes: { p1: 1 }, retweets: { p1: 0 } })

      const result = await service.getPostsByAuthor(userId, authorId)

      expect(result).toHaveLength(1)
      expect(result[0]).toMatchObject({ id: 'p1', authorId, qtyComments: 2, qtyLikes: 1, qtyRetweets: 0 })
      expect(followerService.isFollowing).toHaveBeenCalledWith({ followerId: userId, followedId: authorId })
      expect(repository.getByAuthorId).toHaveBeenCalledWith(authorId)
    })
  })

  describe('createComment', () => {
    it('should create a comment when parent post exists', async () => {
      const userId = 'user-1'
      const parentId = 'post-1'
      const rootId = parentId

      const parentPost: PostDTO = {
        id: parentId,
        authorId: 'author-1',
        content: 'parent',
        images: [],
        createdAt: new Date()
      }

      const data = new CreateCommentInputDTO({ parentId, rootId, content: 'comment' } as any)
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

  describe('countCommentsByRootId', () => {
    it('should return count by rootId', async () => {
      repository.countCommentsByRootId.mockResolvedValue(12)

      const result = await service.countCommentsByRootId('root-1')

      expect(result).toBe(12)
      expect(repository.countCommentsByRootId).toHaveBeenCalledWith('root-1')
    })
  })

  describe('countCommentsByParentId', () => {
    it('should return count by parentId', async () => {
      repository.countCommentsByParentId.mockResolvedValue(4)

      const result = await service.countCommentsByParentId('parent-1')

      expect(result).toBe(4)
      expect(repository.countCommentsByParentId).toHaveBeenCalledWith('parent-1')
    })
  })

  describe('getCommentRootId', () => {
    it('should return post.id when post is not a comment', async () => {
      const post: PostDTO = { id: 'p1', authorId: 'a1', content: 'c', images: [], createdAt: new Date() }
      repository.getById.mockResolvedValue(post)

      const result = await service.getCommentRootId('p1')

      expect(result).toBe('p1')
      expect(repository.getById).toHaveBeenCalledWith('p1')
    })

    it('should return comment.rootId when post is a comment', async () => {
      const comment = new CommentDTO({
        id: 'c1',
        parentId: 'p1',
        rootId: 'r1',
        authorId: 'a1',
        content: 'comment',
        images: [],
        createdAt: new Date()
      } as any)

      repository.getById.mockResolvedValue(comment)

      const result = await service.getCommentRootId('c1')

      expect(result).toBe('r1')
      expect(repository.getById).toHaveBeenCalledWith('c1')
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
