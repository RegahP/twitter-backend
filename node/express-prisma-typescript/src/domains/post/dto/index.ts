import { ArrayMaxSize, IsArray, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator'
import { ExtendedUserDTO } from '@domains/user/dto'
import type { Post } from '@prisma/client'
import { maybeToS3PublicUrl } from '@utils'

export class CreatePostInputDTO {
  @IsString()
  @IsNotEmpty()
  @MaxLength(240)
    content!: string

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(4)
  @IsString({ each: true })
    images?: string[]
}

export class PostDTO {
  constructor (post: Pick<Post, 'id' | 'authorId' | 'content' | 'images' | 'createdAt'>) {
    this.id = post.id
    this.authorId = post.authorId
    this.content = post.content
    this.images = post.images.map(maybeToS3PublicUrl)
    this.createdAt = post.createdAt
  }

  id: string
  authorId: string
  content: string
  images: string[]
  createdAt: Date
}

export class ExtendedPostDTO extends PostDTO {
  constructor (post: PostDTO, author: ExtendedUserDTO, qtyComments: number, qtyLikes: number, qtyRetweets: number) {
    super(post)
    this.author = author
    this.qtyComments = qtyComments
    this.qtyLikes = qtyLikes
    this.qtyRetweets = qtyRetweets
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
  @IsArray()
  @ArrayMaxSize(4)
  @IsString({ each: true })
    images?: string[]
}

export class CreateCommentInputDTO {
  constructor (data: CreateCommentInputDTO) {
    this.parentId = data.parentId
    this.rootId = data.rootId
    this.content = data.content
    this.images = data.images
  }

  @IsString()
  @IsNotEmpty()
    parentId!: string

  @IsString()
  @IsNotEmpty()
    rootId!: string

  @IsString()
  @IsNotEmpty()
  @MaxLength(240)
    content!: string

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(4)
  @IsString({ each: true })
    images?: string[]
}

export class CommentDTO {
  constructor (comment: Post) {
    if (comment.parentId == null || comment.rootId == null) {
      throw new Error('CommentDTO requires a non-null parentId and rootId')
    }
    this.id = comment.id
    this.parentId = comment.parentId
    this.rootId = comment.rootId
    this.authorId = comment.authorId
    this.content = comment.content
    this.images = comment.images.map(maybeToS3PublicUrl)
    this.createdAt = comment.createdAt
  }

  id: string
  parentId: string
  rootId: string
  authorId: string
  content: string
  images: string[]
  createdAt: Date
}

export class ExtendedCommentDTO {
  constructor (comment: CommentDTO, author: ExtendedUserDTO) {
    if (comment.parentId == null || comment.rootId == null) {
      throw new Error('CommentDTO requires a non-null parentId and rootId')
    }
    this.id = comment.id
    this.parentId = comment.parentId
    this.rootId = comment.rootId
    this.author = author
    this.content = comment.content
    this.images = comment.images.map(maybeToS3PublicUrl)
    this.createdAt = comment.createdAt
  }

  id: string
  parentId: string
  rootId: string
  author: ExtendedUserDTO
  content: string
  images: string[]
  createdAt: Date
}

export class CreatePostImageUploadUrlsDTO {
  @IsArray()
  @ArrayMaxSize(4)
  @IsString({ each: true })
    contentTypes!: string[]
}

export class CreatePostImageDeleteUrlsDTO {
  @IsArray()
  @ArrayMaxSize(4)
  @IsString({ each: true })
    keys!: string[]
}
