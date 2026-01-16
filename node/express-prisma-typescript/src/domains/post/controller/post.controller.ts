import { Request, Response, Router } from 'express'
import HttpStatus from 'http-status'
// express-async-errors is a module that handles async errors in express, don't forget import it in your new controllers
import 'express-async-errors'

import { assertAllowedImageContentType, assertUserPostImageKey, isHttpUrl, buildPostImageKey, createPresignedDeleteUrl, createPresignedPutUrl, db, BodyValidation, ValidationException } from '@utils'
import { randomUUID } from 'crypto'

import { PostRepositoryImpl } from '../repository'
import { PostService, PostServiceImpl } from '../service'
import { CreatePostImageDeleteUrlsDTO, CreatePostImageUploadUrlsDTO, CreatePostInputDTO, CreateCommentBodyDTO, CreateCommentInputDTO } from '../dto'
import { UserServiceImpl } from '@domains/user/service'
import { UserRepositoryImpl } from '@domains/user/repository'
import { FollowerServiceImpl } from '@domains/follower/service'
import { FollowerRepositoryImpl } from '@domains/follower/repository'
import { ReactionServiceImpl } from '@domains/reaction/service'
import { ReactionRepositoryImpl } from '@domains/reaction/repository'

export const postRouter = Router()

// Use dependency injection
const postRepository = new PostRepositoryImpl(db)
const service: PostService = new PostServiceImpl(
  postRepository,
  new UserServiceImpl(new UserRepositoryImpl(db)),
  new FollowerServiceImpl(new FollowerRepositoryImpl(db)),
  new ReactionServiceImpl(new ReactionRepositoryImpl(db), postRepository)
)

postRouter.get('/', async (req: Request, res: Response) => {
  const { userId } = res.locals.context as { userId: string }
  const { limit, self, before, after } = req.query as Record<string, string>

  const posts = await service.getLatestPosts(userId, self === 'true', { limit: Number(limit), before, after })

  return res.status(HttpStatus.OK).json(posts)
})

postRouter.post(
  '/images/upload-urls',
  BodyValidation(CreatePostImageUploadUrlsDTO),
  async (req: Request, res: Response) => {
    const { userId } = res.locals.context as { userId: string }
    const { contentTypes } = req.body as CreatePostImageUploadUrlsDTO

    for (const contentType of contentTypes) {
      try {
        assertAllowedImageContentType(contentType)
      } catch (err) {
        throw new ValidationException([{ field: 'contentTypes', message: (err as Error).message }])
      }
    }

    const uploads = await Promise.all(
      contentTypes.map(async contentType => {
        const key = buildPostImageKey(userId, contentType, randomUUID())
        return await createPresignedPutUrl({ key, contentType })
      })
    )

    return res.status(HttpStatus.OK).json({ uploads })
  }
)

postRouter.post(
  '/images/delete-urls',
  BodyValidation(CreatePostImageDeleteUrlsDTO),
  async (req: Request, res: Response) => {
    const { userId } = res.locals.context as { userId: string }
    const { keys } = req.body as CreatePostImageDeleteUrlsDTO

    for (const key of keys) {
      if (isHttpUrl(key)) {
        throw new ValidationException([{ field: 'keys', message: 'keys must be S3 object keys, not URLs' }])
      }

      try {
        assertUserPostImageKey(userId, key)
      } catch (err) {
        throw new ValidationException([{ field: 'keys', message: (err as Error).message }])
      }
    }

    const deletes = await Promise.all(
      keys.map(async key => {
        const { deleteUrl } = await createPresignedDeleteUrl({ key })
        return { key, deleteUrl }
      })
    )

    return res.status(HttpStatus.OK).json({ deletes })
  }
)

postRouter.get('/by_user/:userId', async (req: Request, res: Response) => {
  const { userId } = res.locals.context as { userId: string }
  const { userId: authorId } = req.params

  const posts = await service.getPostsByAuthor(userId, authorId)

  return res.status(HttpStatus.OK).json(posts)
})

postRouter.get('/:postId', async (req: Request, res: Response) => {
  const { userId } = res.locals.context as { userId: string }
  const { postId } = req.params

  const post = await service.getPost(userId, postId)

  return res.status(HttpStatus.OK).json(post)
})

postRouter.post('/', BodyValidation(CreatePostInputDTO), async (req: Request, res: Response) => {
  const { userId } = res.locals.context as { userId: string }
  const data = req.body as CreatePostInputDTO

  if (data.images != null) {
    for (const image of data.images) {
      if (!isHttpUrl(image)) {
        try {
          assertUserPostImageKey(userId, image)
        } catch (err) {
          throw new ValidationException([{ field: 'images', message: (err as Error).message }])
        }
      }
    }
  }

  const post = await service.createPost(userId, data)

  return res.status(HttpStatus.CREATED).json(post)
})

postRouter.delete('/:postId', async (req: Request, res: Response) => {
  const { userId } = res.locals.context as { userId: string }
  const { postId } = req.params

  await service.deletePost(userId, postId)

  return res.status(HttpStatus.OK).send(`Deleted post ${postId}`)
})

postRouter.post('/:postId/comment', BodyValidation(CreateCommentBodyDTO), async (req: Request, res: Response) => {
  const { userId } = res.locals.context as { userId: string }
  const { postId } = req.params
  const body = req.body as CreateCommentBodyDTO

  if (body.images != null) {
    for (const image of body.images) {
      if (!isHttpUrl(image)) {
        try {
          assertUserPostImageKey(userId, image)
        } catch (err) {
          throw new ValidationException([{ field: 'images', message: (err as Error).message }])
        }
      }
    }
  }

  const rootId = await service.getCommentRootId(postId)

  const comment = await service.createComment(userId, new CreateCommentInputDTO({
    parentId: postId,
    rootId,
    content: body.content,
    images: body.images
  }))

  return res.status(HttpStatus.CREATED).json(comment)
})

postRouter.get('/:postId/comments', async (req: Request, res: Response) => {
  const { postId } = req.params
  const { limit, skip } = req.query as Record<string, string>

  const comments = await service.getComments(postId, { limit: Number(limit), skip: Number(skip) })

  return res.status(HttpStatus.OK).json(comments)
})

postRouter.get('/:postId/comment_count_parent', async (req: Request, res: Response) => {
  const { postId } = req.params
  const count = await service.countCommentsByParentId(postId)

  return res.status(HttpStatus.OK).json({ count })
})

postRouter.get('/:postId/comment_count_root', async (req: Request, res: Response) => {
  const { postId } = req.params
  const count = await service.countCommentsByRootId(postId)

  return res.status(HttpStatus.OK).json({ count })
})
