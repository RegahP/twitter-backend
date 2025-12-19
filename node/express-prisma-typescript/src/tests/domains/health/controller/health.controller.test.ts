import express from 'express'
import request from 'supertest'

import { healthRouter } from '@domains/health/controller'

describe('Health Controller (happy paths)', () => {
  it('GET / should return 200', async () => {
    const app = express()
    app.use('/', healthRouter)

    await request(app).get('/').expect(200)
  })
})
