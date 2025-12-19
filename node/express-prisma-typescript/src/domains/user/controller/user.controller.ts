import { Request, Response, Router } from 'express'
import HttpStatus from 'http-status'
// express-async-errors is a module that handles async errors in express, don't forget import it in your new controllers
import 'express-async-errors'

import { assertUserProfileImageKey, assertAllowedImageContentType, BodyValidation, ValidationException, buildUserProfileImageKey, createPresignedPutUrl, db } from '@utils'
import { randomUUID } from 'crypto'

import { UserRepositoryImpl } from '../repository'
import { UserService, UserServiceImpl } from '../service'
import { CreateProfileImageUploadUrlDTO, SetProfileImageKeyDTO } from '../dto'

export const userRouter = Router()

// Use dependency injection
const service: UserService = new UserServiceImpl(new UserRepositoryImpl(db))

userRouter.get('/', async (req: Request, res: Response) => {
  const { userId } = res.locals.context as { userId: string }
  const { limit, skip } = req.query as Record<string, string>

  const users = await service.getUserRecommendations(userId, { limit: Number(limit), skip: Number(skip) })

  return res.status(HttpStatus.OK).json(users)
})

userRouter.get('/me', async (req: Request, res: Response) => {
  const { userId } = res.locals.context as { userId: string }

  const user = await service.getUser(userId)

  return res.status(HttpStatus.OK).json(user)
})

userRouter.post(
  '/me/profile-image/upload-url',
  BodyValidation(CreateProfileImageUploadUrlDTO),
  async (req: Request, res: Response) => {
    const { userId } = res.locals.context as { userId: string }
    const { contentType } = req.body as CreateProfileImageUploadUrlDTO

    try {
      assertAllowedImageContentType(contentType)
    } catch (err) {
      throw new ValidationException([{ field: 'contentType', message: (err as Error).message }])
    }

    const key = buildUserProfileImageKey(userId, contentType, randomUUID())
    const result = await createPresignedPutUrl({ key, contentType })

    return res.status(HttpStatus.OK).json(result)
  }
)

userRouter.patch(
  '/me/profile-image',
  BodyValidation(SetProfileImageKeyDTO),
  async (req: Request, res: Response) => {
    const { userId } = res.locals.context as { userId: string }
    const { profileImageKey } = req.body as SetProfileImageKeyDTO

    try {
      assertUserProfileImageKey(userId, profileImageKey)
    } catch (err) {
      throw new ValidationException([{ field: 'profileImageKey', message: (err as Error).message }])
    }

    const user = await service.setProfileImageKey(userId, profileImageKey)
    return res.status(HttpStatus.OK).json(user)
  }
)

userRouter.get('/:userId', async (req: Request, res: Response) => {
  const { userId: otherUserId } = req.params

  const user = await service.getUser(otherUserId)

  return res.status(HttpStatus.OK).json(user)
})

userRouter.delete('/', async (req: Request, res: Response) => {
  const { userId } = res.locals.context

  await service.deleteUser(userId)

  return res.sendStatus(HttpStatus.OK)
})
