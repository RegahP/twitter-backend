import express from 'express'
import request from 'supertest'

import { postRouter } from '@domains/post/controller'
import { PostServiceImpl } from '@domains/post/service'

const createAuthedApp = (): express.Express => {
  const app = express()
  app.use(express.json())
  app.use((req, res, next) => {
    res.locals.context = { userId: 'user-1' }
    next()
  })
  app.use('/', postRouter)
  return app
}

describe('Post Controller (happy paths)', () => {
  beforeEach(() => {
    jest.restoreAllMocks()
  })

  it('GET / should return 200 + posts', async () => {
    jest
      .spyOn(PostServiceImpl.prototype, 'getLatestPosts')
      .mockResolvedValue([{ id: 'p1', authorId: 'a1', content: 'c1', images: [], createdAt: new Date() }] as any)

    const app = createAuthedApp()
    const res = await request(app).get('/?limit=10').expect(200)
    expect(res.body[0].id).toBe('p1')
  })

  it('POST /images/upload-urls should return 200 + uploads', async () => {
    const app = createAuthedApp()
    const res = await request(app)
      .post('/images/upload-urls')
      .send({ contentTypes: ['image/png'] })
      .expect(200)

    expect(res.body.uploads).toHaveLength(1)
    expect(res.body.uploads[0]).toHaveProperty('uploadUrl')
    expect(res.body.uploads[0]).toHaveProperty('publicUrl')
    expect(res.body.uploads[0]).toHaveProperty('key')
  })

  it('POST /images/delete-urls should return 200 + deletes', async () => {
    const app = createAuthedApp()
    const res = await request(app)
      .post('/images/delete-urls')
      .send({ keys: ['posts/user-1/abc.png'] })
      .expect(200)

    expect(res.body.deletes).toHaveLength(1)
    expect(res.body.deletes[0]).toHaveProperty('deleteUrl')
    expect(res.body.deletes[0]).toHaveProperty('key', 'posts/user-1/abc.png')
  })

  it('GET /by_user/:userId should return 200 + posts', async () => {
    jest
      .spyOn(PostServiceImpl.prototype, 'getPostsByAuthor')
      .mockResolvedValue([{ id: 'p1', authorId: 'a1', content: 'c1', images: [], createdAt: new Date() }] as any)

    const app = createAuthedApp()
    const res = await request(app).get('/by_user/a1').expect(200)
    expect(res.body[0].authorId).toBe('a1')
  })

  it('GET /:postId should return 200 + post', async () => {
    jest.spyOn(PostServiceImpl.prototype, 'getPost').mockResolvedValue({
      id: 'p1',
      authorId: 'a1',
      content: 'c1',
      images: [],
      createdAt: new Date()
    } as any)

    const app = createAuthedApp()
    const res = await request(app).get('/p1').expect(200)
    expect(res.body.id).toBe('p1')
  })

  it('POST / should return 201 + created post', async () => {
    jest.spyOn(PostServiceImpl.prototype, 'createPost').mockResolvedValue({
      id: 'p1',
      authorId: 'user-1',
      content: 'hello',
      images: [],
      createdAt: new Date()
    } as any)

    const app = createAuthedApp()
    const res = await request(app).post('/').send({ content: 'hello' }).expect(201)
    expect(res.body.id).toBe('p1')
  })

  it('DELETE /:postId should return 200', async () => {
    jest.spyOn(PostServiceImpl.prototype, 'deletePost').mockResolvedValue(undefined)

    const app = createAuthedApp()
    await request(app).delete('/p1').expect(200)
  })

  it('POST /:postId/comment should return 201 + comment', async () => {
    jest.spyOn(PostServiceImpl.prototype, 'getCommentRootId').mockResolvedValue('root-1')

    const createCommentSpy = jest.spyOn(PostServiceImpl.prototype, 'createComment').mockResolvedValue({
      id: 'c1',
      parentId: 'p1',
      rootId: 'root-1',
      authorId: 'user-1',
      content: 'comment',
      images: [],
      createdAt: new Date()
    } as any)

    const app = createAuthedApp()
    const res = await request(app).post('/p1/comment').send({ content: 'comment' }).expect(201)

    expect(res.body.parentId).toBe('p1')
    expect(res.body.rootId).toBe('root-1')
    expect(PostServiceImpl.prototype.getCommentRootId).toHaveBeenCalledWith('p1')
    expect(createCommentSpy).toHaveBeenCalledWith(
      'user-1',
      expect.objectContaining({ parentId: 'p1', rootId: 'root-1', content: 'comment' })
    )
  })

  it('GET /:postId/comments should return 200 + comments', async () => {
    jest
      .spyOn(PostServiceImpl.prototype, 'getComments')
      .mockResolvedValue([
        { id: 'c1', parentId: 'p1', authorId: 'user-1', content: 'comment', images: [], createdAt: new Date() }
      ] as any)

    const app = createAuthedApp()
    const res = await request(app).get('/p1/comments?limit=10&skip=0').expect(200)
    expect(res.body[0].parentId).toBe('p1')
  })

  it('GET /:postId/comment_count_parent should return 200 + count', async () => {
    jest.spyOn(PostServiceImpl.prototype, 'countCommentsByParentId').mockResolvedValue(5)

    const app = createAuthedApp()
    const res = await request(app).get('/p1/comment_count_parent').expect(200)

    expect(res.body).toEqual({ count: 5 })
  })

  it('GET /:postId/comment_count_root should return 200 + count', async () => {
    jest.spyOn(PostServiceImpl.prototype, 'countCommentsByRootId').mockResolvedValue(9)

    const app = createAuthedApp()
    const res = await request(app).get('/p1/comment_count_root').expect(200)

    expect(res.body).toEqual({ count: 9 })
  })
})
