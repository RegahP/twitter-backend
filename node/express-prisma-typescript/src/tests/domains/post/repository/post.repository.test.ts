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

  it('countCommentsByRootId should return count', async () => {
    const db = new PrismaClient() as any
    const repo = new PostRepositoryImpl(db)

    ;(db.post.count as jest.Mock).mockResolvedValue(7)

    const result = await repo.countCommentsByRootId('root-1')

    expect(db.post.count).toHaveBeenCalledWith({ where: { rootId: 'root-1' } })
    expect(result).toBe(7)
  })

  it('countCommentsByParentId should return count', async () => {
    const db = new PrismaClient() as any
    const repo = new PostRepositoryImpl(db)

    ;(db.post.count as jest.Mock).mockResolvedValue(3)

    const result = await repo.countCommentsByParentId('parent-1')

    expect(db.post.count).toHaveBeenCalledWith({ where: { parentId: 'parent-1' } })
    expect(result).toBe(3)
  })

  it('getCommentsByParentId should query and return CommentDTOs', async () => {
    const db = new PrismaClient() as any
    const repo = new PostRepositoryImpl(db)

    const createdAt = new Date()
    ;(db.post.findMany as jest.Mock).mockResolvedValue([
      {
        id: 'c1',
        parentId: 'p1',
        rootId: 'r1',
        authorId: 'u1',
        content: 'comment',
        images: [],
        createdAt
      }
    ])

    const result = await repo.getCommentsByParentId('p1', { limit: 5, skip: 10 })

    expect(db.post.findMany).toHaveBeenCalledWith({
      where: { parentId: 'p1' },
      take: 5,
      skip: 10,
      orderBy: [{ createdAt: 'asc' }, { id: 'asc' }]
    })
    expect(result).toHaveLength(1)
    expect(result[0]).toMatchObject({ id: 'c1', parentId: 'p1', rootId: 'r1', authorId: 'u1', content: 'comment', images: [] })
  })
})
