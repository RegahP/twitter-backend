import { CreatePostInputDTO, PostDTO } from '../dto'
import { PostRepository } from '../repository'
import { PostService } from '.'
import { validate } from 'class-validator'
import { ForbiddenException, NotFoundException } from '@utils'
import { CursorPagination } from '@types'
import { UserService } from '@domains/user/service'
import { FollowerService } from '@domains/follower/service'
import { UserDTO } from '@domains/user/dto'

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
    const isFollowing = await this.followerService.isFollowing({ followerId: userId, followedId: post.authorId })
    if (!isFollowing) {
      const isPublic = await this.userService.isPublicProfile(post.authorId)
      if (!isPublic) throw new ForbiddenException()
    }
    return post
  }

  async getLatestPosts (userId: string, options: CursorPagination): Promise<PostDTO[]> {
    const posts = await this.repository.getAllByDatePaginated(options)
    const followingList: UserDTO[] = await this.followerService.getFollowing(userId, options)
    const filteredPosts = posts.filter(post => {
      return followingList.some(user => user.id === post.authorId)
    })
    return filteredPosts
  }

  async getPostsByAuthor (userId: any, authorId: string): Promise<PostDTO[]> {
    const isFollowing = await this.followerService.isFollowing({ followerId: userId, followedId: authorId })
    if (!isFollowing) {
      const isPublic = await this.userService.isPublicProfile(authorId)
      if (!isPublic) throw new ForbiddenException()
    }
    return await this.repository.getByAuthorId(authorId)
  }
}
