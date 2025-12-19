import express from 'express'
import request from 'supertest'

import { userRouter } from '@domains/user/controller'
import { UserServiceImpl } from '@domains/user/service'

const createAuthedApp = (): express.Express => {
  const app = express()
  app.use(express.json())
  app.use((req, res, next) => {
    res.locals.context = { userId: 'user-1' }
    next()
  })
  app.use('/', userRouter)
  return app
}

describe('User Controller (happy paths)', () => {
  beforeEach(() => {
    jest.restoreAllMocks()
  })

  it('GET / should return 200 + users', async () => {
    jest
      .spyOn(UserServiceImpl.prototype, 'getUserRecommendations')
      .mockResolvedValue([
        { id: 'u2', name: 'n2', createdAt: new Date(), isPublic: true, profileImageUrl: null }
      ] as any)

    const app = createAuthedApp()
    const res = await request(app).get('/?limit=10&skip=0').expect(200)
    expect(res.body[0].id).toBe('u2')
  })

  it('GET /me should return 200 + user', async () => {
    jest.spyOn(UserServiceImpl.prototype, 'getUser').mockResolvedValue({
      id: 'user-1',
      name: 'me',
      createdAt: new Date(),
      isPublic: true,
      profileImageUrl: null
    } as any)

    const app = createAuthedApp()
    const res = await request(app).get('/me').expect(200)
    expect(res.body.id).toBe('user-1')
  })

  it('POST /me/profile-image/upload-url should return 200 + presigned upload', async () => {
    const app = createAuthedApp()
    const res = await request(app).post('/me/profile-image/upload-url').send({ contentType: 'image/png' }).expect(200)

    expect(res.body).toHaveProperty('uploadUrl')
    expect(res.body).toHaveProperty('publicUrl')
    expect(typeof res.body.key).toBe('string')
  })

  it('PATCH /me/profile-image should return 200 + updated user', async () => {
    jest.spyOn(UserServiceImpl.prototype, 'setProfileImageKey').mockResolvedValue({
      id: 'user-1',
      name: 'me',
      createdAt: new Date(),
      isPublic: true,
      profileImageUrl: 'https://public'
    } as any)

    const app = createAuthedApp()
    const res = await request(app)
      .patch('/me/profile-image')
      .send({ profileImageKey: 'users/user-1/profile/abc.png' })
      .expect(200)

    expect(res.body.id).toBe('user-1')
  })

  it('GET /:userId should return 200 + user', async () => {
    jest.spyOn(UserServiceImpl.prototype, 'getUser').mockResolvedValue({
      id: 'u2',
      name: 'n2',
      createdAt: new Date(),
      isPublic: true,
      profileImageUrl: null
    } as any)

    const app = createAuthedApp()
    const res = await request(app).get('/u2').expect(200)
    expect(res.body.id).toBe('u2')
  })

  it('DELETE / should return 200', async () => {
    jest.spyOn(UserServiceImpl.prototype, 'deleteUser').mockResolvedValue(undefined)

    const app = createAuthedApp()
    await request(app).delete('/').expect(200)
  })
})
