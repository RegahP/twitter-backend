import { CommentDTO, CreateCommentInputDTO, CreatePostInputDTO, PostDTO } from '../dto'
import { PostRepository } from '../repository'
import { PostService } from '.'
import { validate } from 'class-validator'
import { ForbiddenException, NotFoundException } from '@utils'
import { CursorPagination, OffsetPagination } from '@types'
import { UserService } from '@domains/user/service'
import { FollowerService } from '@domains/follower/service'

export class PostServiceImpl implements PostService {
  constructor (
    private readonly repository: PostRepository,
    private readonly userService: UserService,
    private readonly followerService: FollowerService
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

  async getPost (userId: string, postId: string): Promise<PostDTO> {
    const post = await this.repository.getById(postId)
    if (!post) throw new NotFoundException('post')
    this.ex()
    const isFollowing = await this.followerService.isFollowing({ followerId: userId, followedId: post.authorId })
    if (!isFollowing) {
      const isPublic = await this.userService.isPublicProfile(post.authorId)
      if (!isPublic) throw new ForbiddenException()
    }
    return post
  }

  async getLatestPosts (userId: string, options: CursorPagination): Promise<PostDTO[]> {
    return await this.repository.getAllFollowedByDatePaginated(userId, options)
  }

  async getPostsByAuthor (userId: any, authorId: string): Promise<PostDTO[]> {
    const isFollowing = await this.followerService.isFollowing({ followerId: userId, followedId: authorId })
    if (!isFollowing) {
      const isPublic = await this.userService.isPublicProfile(authorId)
      if (!isPublic) throw new ForbiddenException()
    }
    return await this.repository.getByAuthorId(authorId)
  }

  async createComment (userId: string, data: CreateCommentInputDTO): Promise<CommentDTO> {
    await validate(data)
    const post = await this.repository.getById(data.parentId)
    if (!post) throw new NotFoundException('post')
    return await this.repository.createComment(userId, data)
  }

  async getComments (postId: string, options: OffsetPagination): Promise<CommentDTO[]> {
    const post = await this.repository.getById(postId)
    if (!post) throw new NotFoundException('post')
    return await this.repository.getCommentsByParentId(postId, options)
  }

  private ex (): number {
    return 42
  }
}
