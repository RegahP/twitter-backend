import express from 'express'
import request from 'supertest'

import { authRouter } from '@domains/auth/controller'
import { AuthServiceImpl } from '@domains/auth/service'

describe('Auth Controller (happy paths)', () => {
  beforeEach(() => {
    jest.restoreAllMocks()
  })

  it('POST /signup should return 201 + token', async () => {
    jest.spyOn(AuthServiceImpl.prototype, 'signup').mockResolvedValue({ token: 'test-token' })

    const app = express()
    app.use(express.json())
    app.use('/', authRouter)

    await request(app)
      .post('/signup')
      .send({
        email: 'test@example.com',
        username: 'testuser',
        password: 'Str0ngP@ssw0rd!'
      })
      .expect(201)
      .expect({ token: 'test-token' })
  })

  it('POST /login should return 200 + token', async () => {
    jest.spyOn(AuthServiceImpl.prototype, 'login').mockResolvedValue({ token: 'test-token' })

    const app = express()
    app.use(express.json())
    app.use('/', authRouter)

    await request(app)
      .post('/login')
      .send({
        email: 'test@example.com',
        password: 'Str0ngP@ssw0rd!'
      })
      .expect(200)
      .expect({ token: 'test-token' })
  })
})
