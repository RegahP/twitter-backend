import { Request, Response, Router } from 'express'
import HttpStatus from 'http-status'
import 'express-async-errors'

import { db, ValidationException } from '@utils'
import { ReactionInputDTO } from '../dto'
import { ReactionRepositoryImpl } from '../repository'
import { ReactionService, ReactionServiceImpl } from '../service'
import { PostRepositoryImpl } from '@domains/post/repository'

export const reactionRouter = Router()

const service: ReactionService = new ReactionServiceImpl(
  new ReactionRepositoryImpl(db),
  new PostRepositoryImpl(db)
)

reactionRouter.post('/:postId/', async (req: Request, res: Response) => {
  const { userId } = res.locals.context
  const { postId } = req.params as { postId: string }
  const { type } = req.query as { type?: string }

  if (type !== 'like' && type !== 'retweet') {
    throw new ValidationException([{ field: 'type', message: "type must be 'like' or 'retweet'" }])
  }

  const reaction = await service.reactToPost(userId, new ReactionInputDTO({ postId, type }))
  return res.status(HttpStatus.CREATED).json(reaction)
})

reactionRouter.delete('/:postId/', async (req: Request, res: Response) => {
  const { userId } = res.locals.context
  const { postId } = req.params as { postId: string }
  const { type } = req.query as { type?: string }

  if (type !== 'like' && type !== 'retweet') {
    throw new ValidationException([{ field: 'type', message: "type must be 'like' or 'retweet'" }])
  }

  await service.deleteReaction(userId, new ReactionInputDTO({ postId, type }))

  return res.status(HttpStatus.OK).send(`Deleted ${type} on post ${postId}`)
})
