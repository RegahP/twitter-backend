import { Request, Response, Router } from 'express'
import HttpStatus from 'http-status'
// express-async-errors is a module that handles async errors in express, don't forget import it in your new controllers
import 'express-async-errors'

import { db } from '@utils'

import { FollowerRepositoryImpl } from '../repository'
import { FollowerService, FollowerServiceImpl } from '../service'
import { FollowInputDTO } from '../dto'

export const followerRouter = Router()

// Use dependency injection
const followerRepository = new FollowerRepositoryImpl(db)
const followerService: FollowerService = new FollowerServiceImpl(followerRepository)

followerRouter.post('/follow/:userId', async (req: Request, res: Response) => {
  const { userId } = res.locals.context
  const { followedId } = req.body
  await followerService.followUser(new FollowInputDTO({ followerId: userId, followedId }))
  res.sendStatus(HttpStatus.OK)
})

followerRouter.post('/unfollow/:userId', async (req: Request, res: Response) => {
  const { userId } = res.locals.context
  const { followedId } = req.body
  const unfollow = await followerService.unfollowUser(new FollowInputDTO({ followerId: userId, followedId }))
  res.status(HttpStatus.OK).json({ unfollow })
})

followerRouter.get('/is-following', async (req: Request<any, any, any, { followedId: string }>, res: Response) => {
  const { userId }: { userId: string } = res.locals.context
  const { followedId } = req.query
  const isFollowing = await followerService.isFollowing(new FollowInputDTO({ followerId: userId, followedId }))
  res.status(HttpStatus.OK).json({ isFollowing })
})

followerRouter.get('/followers/:userId', async (req: Request, res: Response) => {
  const { userId } = req.params
  const { limit, skip } = req.query as Record<string, string>
  const followers = await followerService.getFollowers(userId, { limit: Number(limit), skip: Number(skip) })
  res.status(HttpStatus.OK).json(followers)
})

followerRouter.get('/following/:userId', async (req: Request, res: Response) => {
  const { userId } = req.params
  const { limit, skip } = req.query as Record<string, string>
  const following = await followerService.getFollowing(userId, { limit: Number(limit), skip: Number(skip) })
  res.status(HttpStatus.OK).json(following)
})
