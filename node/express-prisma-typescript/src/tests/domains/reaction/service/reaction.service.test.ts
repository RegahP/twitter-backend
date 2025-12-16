import { ReactionServiceImpl } from '@domains/reaction/service'
import { ReactionRepository } from '@domains/reaction/repository'
import { ReactionDTO, ReactionInputDTO } from '@domains/reaction/dto'
import { PostRepository } from '@domains/post/repository'
import { PostDTO } from '@domains/post/dto'

describe('ReactionServiceImpl', () => {
  let reactionRepository: jest.Mocked<ReactionRepository>
  let postRepository: jest.Mocked<PostRepository>
  let service: ReactionServiceImpl

  beforeAll(() => {
    reactionRepository = {
      react: jest.fn(),
      deleteReaction: jest.fn(),
      getReaction: jest.fn()
    }

    postRepository = {
      create: jest.fn(),
      getAllByDatePaginated: jest.fn(),
      delete: jest.fn(),
      getById: jest.fn(),
      getByAuthorId: jest.fn(),
      createComment: jest.fn(),
      getCommentsByParentId: jest.fn()
    }

    service = new ReactionServiceImpl(reactionRepository, postRepository)
  })

  describe('reactToPost', () => {
    it('should create a reaction when post exists and reaction does not exist', async () => {
      const userId = 'user-1'
      const data: ReactionInputDTO = { postId: 'post-1', type: 'like' }
      const post: PostDTO = {
        id: data.postId,
        authorId: 'author-1',
        content: 'hello',
        images: [],
        createdAt: new Date()
      }
      const reaction: ReactionDTO = {
        id: 'reaction-1',
        userId,
        postId: data.postId,
        type: 'like',
        createdAt: new Date()
      }

      postRepository.getById.mockResolvedValue(post)
      reactionRepository.getReaction.mockResolvedValue(null)
      reactionRepository.react.mockResolvedValue(reaction)

      const result = await service.reactToPost(userId, data)

      expect(result).toEqual(reaction)
      expect(postRepository.getById).toHaveBeenCalledWith(data.postId)
      expect(reactionRepository.getReaction).toHaveBeenCalledWith(userId, data)
      expect(reactionRepository.react).toHaveBeenCalledWith(userId, data)
    })
  })

  describe('deleteReaction', () => {
    it('should delete a reaction when post and reaction exist', async () => {
      const userId = 'user-1'
      const data: ReactionInputDTO = { postId: 'post-1', type: 'retweet' }
      const post: PostDTO = {
        id: data.postId,
        authorId: 'author-1',
        content: 'hello',
        images: [],
        createdAt: new Date()
      }
      const existingReaction: ReactionDTO = {
        id: 'reaction-1',
        userId,
        postId: data.postId,
        type: 'retweet',
        createdAt: new Date()
      }

      postRepository.getById.mockResolvedValue(post)
      reactionRepository.getReaction.mockResolvedValue(existingReaction)
      reactionRepository.deleteReaction.mockResolvedValue(undefined)

      await service.deleteReaction(userId, data)

      expect(postRepository.getById).toHaveBeenCalledWith(data.postId)
      expect(reactionRepository.getReaction).toHaveBeenCalledWith(userId, data)
      expect(reactionRepository.deleteReaction).toHaveBeenCalledWith(userId, data)
    })
  })
})
