import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator'
import { ExtendedUserDTO } from '@domains/user/dto'
import type { Post } from 'generated/prisma/client'

export class CreatePostInputDTO {
  @IsString()
  @IsNotEmpty()
  @MaxLength(240)
    content!: string

  @IsOptional()
  @MaxLength(4) // this is individually limiting each string, not the array length
    images?: string[]
}

export class PostDTO {
  constructor (post: PostDTO) {
    this.id = post.id
    this.authorId = post.authorId
    this.content = post.content
    this.images = post.images
    this.createdAt = post.createdAt
  }

  id: string
  authorId: string
  content: string
  images: string[]
  createdAt: Date
}

export class ExtendedPostDTO extends PostDTO {
  constructor (post: ExtendedPostDTO) {
    super(post)
    this.author = post.author
    this.qtyComments = post.qtyComments
    this.qtyLikes = post.qtyLikes
    this.qtyRetweets = post.qtyRetweets
  }

  author!: ExtendedUserDTO
  qtyComments!: number
  qtyLikes!: number
  qtyRetweets!: number
}

export class CreateCommentBodyDTO {
  @IsString()
  @IsNotEmpty()
  @MaxLength(240)
    content!: string

  @IsOptional()
  @MaxLength(4)
    images?: string[]
}

export class CreateCommentInputDTO {
  constructor (data: CreateCommentInputDTO) {
    this.parentId = data.parentId
    this.content = data.content
    this.images = data.images
  }

  @IsString()
  @IsNotEmpty()
    parentId!: string

  @IsString()
  @IsNotEmpty()
  @MaxLength(240)
    content!: string

  @IsOptional()
  @MaxLength(4)
    images?: string[]
}

export class CommentDTO {
  constructor (comment: Post) {
    if (comment.parentId == null) {
      throw new Error('CommentDTO requires a non-null parentId')
    }
    this.id = comment.id
    this.parentId = comment.parentId
    this.authorId = comment.authorId
    this.content = comment.content
    this.images = comment.images
    this.createdAt = comment.createdAt
  }

  id: string
  parentId: string
  authorId: string
  content: string
  images: string[]
  createdAt: Date
}
