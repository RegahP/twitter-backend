import express from 'express'
import request from 'supertest'

import { followerRouter } from '@domains/follower/controller'
import { FollowerServiceImpl } from '@domains/follower/service'

const createAuthedApp = (): express.Express => {
  const app = express()
  app.use(express.json())
  app.use((req, res, next) => {
    res.locals.context = { userId: 'user-1' }
    next()
  })
  app.use('/', followerRouter)
  return app
}

describe('Follower Controller (happy paths)', () => {
  beforeEach(() => {
    jest.restoreAllMocks()
  })

  it('POST /follow/:userId should return 200', async () => {
    jest.spyOn(FollowerServiceImpl.prototype, 'followUser').mockResolvedValue({} as any)

    const app = createAuthedApp()
    await request(app).post('/follow/user-2').send({ followedId: 'user-2' }).expect(200)
  })

  it('POST /unfollow/:userId should return 200 + {unfollow:true}', async () => {
    jest.spyOn(FollowerServiceImpl.prototype, 'unfollowUser').mockResolvedValue(true)

    const app = createAuthedApp()
    await request(app).post('/unfollow/user-2').send({ followedId: 'user-2' }).expect(200).expect({ unfollow: true })
  })

  it('GET /is-following should return 200 + {isFollowing:true}', async () => {
    jest.spyOn(FollowerServiceImpl.prototype, 'isFollowing').mockResolvedValue(true)

    const app = createAuthedApp()
    await request(app).get('/is-following?followedId=user-2').expect(200).expect({ isFollowing: true })
  })

  it('GET /followers/:userId should return 200 + followers', async () => {
    jest
      .spyOn(FollowerServiceImpl.prototype, 'getFollowers')
      .mockResolvedValue([
        { id: 'u2', name: 'n2', createdAt: new Date(), isPublic: true, profileImageUrl: null }
      ] as any)

    const app = createAuthedApp()
    const res = await request(app).get('/followers/user-1').expect(200)
    expect(Array.isArray(res.body)).toBe(true)
    expect(res.body[0].id).toBe('u2')
  })

  it('GET /following/:userId should return 200 + following', async () => {
    jest
      .spyOn(FollowerServiceImpl.prototype, 'getFollowing')
      .mockResolvedValue([
        { id: 'u3', name: 'n3', createdAt: new Date(), isPublic: true, profileImageUrl: null }
      ] as any)

    const app = createAuthedApp()
    const res = await request(app).get('/following/user-1').expect(200)
    expect(Array.isArray(res.body)).toBe(true)
    expect(res.body[0].id).toBe('u3')
  })
})
