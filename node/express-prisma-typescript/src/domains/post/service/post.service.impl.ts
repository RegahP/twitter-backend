import { CommentDTO, CreateCommentInputDTO, CreatePostInputDTO, ExtendedCommentDTO, ExtendedPostDTO, PostDTO } from '../dto'
import { PostRepository } from '../repository'
import { PostService } from '.'
import { validate } from 'class-validator'
import { ForbiddenException, NotFoundException } from '@utils'
import { CursorPagination, OffsetPagination } from '@types'
import { UserService } from '@domains/user/service'
import { FollowerService } from '@domains/follower/service'
import { ReactionService } from '@domains/reaction/service'

export class PostServiceImpl implements PostService {
  constructor (
    private readonly repository: PostRepository,
    private readonly userService: UserService,
    private readonly followerService: FollowerService,
    private readonly reactionService: ReactionService
  ) {}

  async createPost (userId: string, data: CreatePostInputDTO): Promise<PostDTO> {
    await validate(data)
    return await this.repository.create(userId, data)
  }

  async deletePost (userId: string, postId: string): Promise<void> {
    const post = await this.repository.getById(postId)
    if (!post) throw new NotFoundException('post')
    if (post.authorId !== userId) throw new ForbiddenException()
    await this.repository.delete(postId)
  }

  async getPost (userId: string, postId: string): Promise<ExtendedPostDTO> {
    const post = await this.repository.getById(postId)
    if (!post) throw new NotFoundException('post')
    if (post.authorId !== userId) {
      const isFollowing = await this.followerService.isFollowing({ followerId: userId, followedId: post.authorId })
      if (!isFollowing) {
        const isPublic = await this.userService.isPublicProfile(post.authorId)
        if (!isPublic) throw new ForbiddenException()
      }
    }
    const [author, reactionCounts] = await Promise.all([
      this.userService.getUserExtended(post.authorId),
      this.reactionService.countReactionsByPostIds([post.id])
    ])

    const qtyComments = post instanceof CommentDTO
      ? await this.repository.countCommentsByParentId(post.id)
      : (await this.repository.countCommentsByRootIds([post.id]))[post.id] ?? 0

    return new ExtendedPostDTO(
      post,
      author,
      qtyComments,
      reactionCounts.likes[post.id] ?? 0,
      reactionCounts.retweets[post.id] ?? 0
    )
  }

  async getLatestPosts (userId: string, self: boolean, options: CursorPagination): Promise<ExtendedPostDTO[]> {
    const latestPosts = await this.repository.getAllFollowedByDatePaginated(userId, self, options)
    if (latestPosts.length === 0) return []

    const postIds = latestPosts.map(p => p.id)
    const authorIds = Array.from(new Set(latestPosts.map(p => p.authorId)))

    const [authors, commentsByRootId, reactionCounts] = await Promise.all([
      this.userService.getUsersExtended(authorIds),
      this.repository.countCommentsByRootIds(postIds),
      this.reactionService.countReactionsByPostIds(postIds)
    ])

    const authorsById = new Map(authors.map(a => [a.id, a]))

    return latestPosts.map(post => {
      const author = authorsById.get(post.authorId)
      if (author == null) throw new NotFoundException('user')

      return new ExtendedPostDTO(
        post,
        author,
        commentsByRootId[post.id] ?? 0,
        reactionCounts.likes[post.id] ?? 0,
        reactionCounts.retweets[post.id] ?? 0
      )
    })
  }

  async getPostsByAuthor (userId: any, authorId: string): Promise<ExtendedPostDTO[]> {
    if (userId !== authorId) {
      const isFollowing = await this.followerService.isFollowing({ followerId: userId, followedId: authorId })
      if (!isFollowing) {
        const isPublic = await this.userService.isPublicProfile(authorId)
        if (!isPublic) throw new ForbiddenException()
      }
    }

    const posts = await this.repository.getByAuthorId(authorId)
    if (posts.length === 0) return []

    const postIds = posts.map(p => p.id)

    const [author, commentsByRootId, reactionCounts] = await Promise.all([
      this.userService.getUserExtended(authorId),
      this.repository.countCommentsByRootIds(postIds),
      this.reactionService.countReactionsByPostIds(postIds)
    ])

    return posts.map(post => new ExtendedPostDTO(
      post,
      author,
      commentsByRootId[post.id] ?? 0,
      reactionCounts.likes[post.id] ?? 0,
      reactionCounts.retweets[post.id] ?? 0
    ))
  }

  async createComment (userId: string, data: CreateCommentInputDTO): Promise<CommentDTO> {
    await validate(data)
    const post = await this.repository.getById(data.parentId)
    if (!post) throw new NotFoundException('post')
    return await this.repository.createComment(userId, data)
  }

  async getComments (postId: string, options: OffsetPagination): Promise<ExtendedCommentDTO[]> {
    const post = await this.repository.getById(postId)
    if (!post) throw new NotFoundException('post')
    const comments = await this.repository.getCommentsByParentId(postId, options)
    const authorIds = Array.from(new Set(comments.map(c => c.authorId)))
    const authors = await this.userService.getUsersExtended(authorIds)
    const authorsById = new Map(authors.map(a => [a.id, a]))

    return comments.map(comment => {
      const author = authorsById.get(comment.authorId)
      if (author == null) throw new NotFoundException('user')
      return new ExtendedCommentDTO(comment, author)
    })
  }

  async countCommentsByRootId (rootId: string): Promise<number> {
    return await this.repository.countCommentsByRootId(rootId)
  }

  async countCommentsByParentId (parentId: string): Promise<number> {
    return await this.repository.countCommentsByParentId(parentId)
  }

  async getCommentRootId (postId: string): Promise<string> {
    const post: PostDTO | CommentDTO | null = await this.repository.getById(postId)
    if (post == null) throw new NotFoundException('post')
    return post instanceof CommentDTO ? post.rootId : post.id
  }
}
