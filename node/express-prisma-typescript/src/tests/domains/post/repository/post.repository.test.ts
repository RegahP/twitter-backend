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

  it('getById should return CommentDTO when parentId is non-null', async () => {
    const db = new PrismaClient() as any
    const repo = new PostRepositoryImpl(db)

    ;(db.post.findUnique as jest.Mock).mockResolvedValue({
      id: 'c1',
      parentId: 'p1',
      rootId: 'r1',
      authorId: 'u1',
      content: 'comment',
      images: [],
      createdAt: new Date()
    })

    const result: any = await repo.getById('c1')
    expect(result).toMatchObject({ id: 'c1', parentId: 'p1', rootId: 'r1', authorId: 'u1', content: 'comment', images: [] })
  })

  it('countCommentsByRootId should return count', async () => {
    const db = new PrismaClient() as any
    const repo = new PostRepositoryImpl(db)

    ;(db.post.count as jest.Mock).mockResolvedValue(7)

    const result = await repo.countCommentsByRootId('root-1')

    expect(db.post.count).toHaveBeenCalledWith({ where: { rootId: 'root-1', parentId: { not: null } } })
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

  it('countCommentsByRootIds should return {} when empty input', async () => {
    const db = new PrismaClient() as any
    const repo = new PostRepositoryImpl(db)

    const result = await repo.countCommentsByRootIds([])

    expect(result).toEqual({})
    expect(db.post.groupBy).not.toHaveBeenCalled()
  })

  it('countCommentsByRootIds should groupBy rootId and map counts', async () => {
    const db = new PrismaClient() as any
    const repo = new PostRepositoryImpl(db)

    ;(db.post.groupBy as jest.Mock).mockResolvedValue([
      { rootId: 'r1', _count: { _all: 2 } },
      { rootId: 'r2', _count: { _all: 0 } }
    ])

    const result = await repo.countCommentsByRootIds(['r1', 'r2'])

    expect(db.post.groupBy).toHaveBeenCalledWith({
      by: ['rootId'],
      where: { rootId: { in: ['r1', 'r2'] }, parentId: { not: null } },
      _count: { _all: true }
    })
    expect(result).toEqual({ r1: 2, r2: 0 })
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

  it('getAllFollowedByDatePaginated should include self posts when self=true', async () => {
    const db = new PrismaClient() as any
    const repo = new PostRepositoryImpl(db)

    ;(db.post.findMany as jest.Mock).mockResolvedValue([
      { id: 'p1', authorId: 'u1', content: 'c', images: [], createdAt: new Date() }
    ])

    await repo.getAllFollowedByDatePaginated('u1', true, { limit: 10 })

    expect(db.post.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          parentId: null,
          OR: expect.arrayContaining([
            expect.objectContaining({ authorId: 'u1' })
          ])
        })
      })
    )
  })

  it('getAllFollowedByDatePaginated should NOT include self posts when self=false', async () => {
    const db = new PrismaClient() as any
    const repo = new PostRepositoryImpl(db)

    ;(db.post.findMany as jest.Mock).mockResolvedValue([])

    await repo.getAllFollowedByDatePaginated('u1', false, { limit: 10 })

    const args = (db.post.findMany as jest.Mock).mock.calls[0][0]
    const orList = args.where.OR
    expect(Array.isArray(orList)).toBe(true)
    expect(orList.some((c: any) => c?.authorId === 'u1')).toBe(false)
  })
})
