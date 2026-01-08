import express from 'express'
import request from 'supertest'

import { reactionRouter } from '@domains/reaction/controller'
import { ReactionServiceImpl } from '@domains/reaction/service'

const createAuthedApp = (): express.Express => {
  const app = express()
  app.use(express.json())
  app.use((req, res, next) => {
    res.locals.context = { userId: 'user-1' }
    next()
  })
  app.use('/', reactionRouter)
  return app
}

describe('Reaction Controller (happy paths)', () => {
  beforeEach(() => {
    jest.restoreAllMocks()
  })

  it('POST /:postId/?type=like should return 201 + reaction', async () => {
    jest.spyOn(ReactionServiceImpl.prototype, 'reactToPost').mockResolvedValue({
      id: 'r1',
      userId: 'user-1',
      postId: 'post-1',
      type: 'like',
      createdAt: new Date()
    } as any)

    const app = createAuthedApp()
    const res = await request(app).post('/post-1/?type=like').expect(201)
    expect(res.body).toMatchObject({ userId: 'user-1', postId: 'post-1', type: 'like' })
  })

  it('DELETE /:postId/?type=like should return 200', async () => {
    jest.spyOn(ReactionServiceImpl.prototype, 'deleteReaction').mockResolvedValue(undefined)

    const app = createAuthedApp()
    await request(app).delete('/post-1/?type=like').expect(200)
  })

  it('GET /:postId/?type=like should return 200 + reaction (or null)', async () => {
    jest.spyOn(ReactionServiceImpl.prototype, 'getReaction').mockResolvedValue({
      id: 'r1',
      userId: 'user-1',
      postId: 'post-1',
      type: 'like',
      createdAt: new Date()
    } as any)

    const app = createAuthedApp()
    const res = await request(app).get('/post-1/?type=like').expect(200)
    expect(res.body).toMatchObject({ userId: 'user-1', postId: 'post-1', type: 'like' })
  })
})
