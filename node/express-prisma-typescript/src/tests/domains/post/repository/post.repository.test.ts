import { PrismaClient } from '@prisma/client'

import { PostRepositoryImpl } from '@domains/post/repository'
import { CreatePostInputDTO } from '@domains/post/dto'

describe('PostRepositoryImpl (happy paths)', () => {
  it('create should create post and return DTO', async () => {
    const db = new PrismaClient() as any
    const repo = new PostRepositoryImpl(db)

    const data = new CreatePostInputDTO()
    data.content = 'hello';
    (db.post.create as jest.Mock).mockResolvedValue({
      id: 'p1',
      authorId: 'u1',
      content: 'hello',
      images: [],
      createdAt: new Date()
    })

    const result = await repo.create('u1', data)
    expect(db.post.create).toHaveBeenCalled()
    expect(result).toMatchObject({ id: 'p1', authorId: 'u1', content: 'hello', images: [] })
  })

  it('getById should return DTO when found', async () => {
    const db = new PrismaClient() as any
    const repo = new PostRepositoryImpl(db);

    (db.post.findUnique as jest.Mock).mockResolvedValue({
      id: 'p1',
      authorId: 'u1',
      content: 'hello',
      images: [],
      createdAt: new Date()
    })

    const result = await repo.getById('p1')
    expect(result?.id).toBe('p1')
  })
})
