import { PrismaClient } from '@prisma/client'

import { ChatRepositoryImpl } from '@domains/chat/repository'

describe('ChatRepositoryImpl (happy paths)', () => {
  it('createMessage should persist and return DTO', async () => {
    const db = new PrismaClient() as any
    const repo = new ChatRepositoryImpl(db)

    const createdAt = new Date()
    ;(db.chatMessage.create as jest.Mock).mockResolvedValue({
      id: 'm1',
      roomId: 'dm:u1:u2',
      fromUserId: 'u1',
      toUserId: 'u2',
      content: 'hello',
      createdAt
    })

    const result = await repo.createMessage({
      roomId: 'dm:u1:u2',
      fromUserId: 'u1',
      toUserId: 'u2',
      content: 'hello'
    })

    expect(db.chatMessage.create).toHaveBeenCalledWith({
      data: { roomId: 'dm:u1:u2', fromUserId: 'u1', toUserId: 'u2', content: 'hello' }
    })

    expect(result).toMatchObject({
      id: 'm1',
      roomId: 'dm:u1:u2',
      fromUserId: 'u1',
      toUserId: 'u2',
      content: 'hello',
      createdAt
    })
  })

  it('getRecentMessages should fetch desc and return asc', async () => {
    const db = new PrismaClient() as any
    const repo = new ChatRepositoryImpl(db)

    const t1 = new Date('2026-01-01T00:00:00.000Z')
    const t2 = new Date('2026-01-01T00:00:01.000Z')

    // Simulate DB returning newest-first
    ;(db.chatMessage.findMany as jest.Mock).mockResolvedValue([
      { id: 'm2', roomId: 'dm:u1:u2', fromUserId: 'u2', toUserId: 'u1', content: 'yo', createdAt: t2 },
      { id: 'm1', roomId: 'dm:u1:u2', fromUserId: 'u1', toUserId: 'u2', content: 'hi', createdAt: t1 }
    ])

    const result = await repo.getRecentMessages('dm:u1:u2')

    expect(db.chatMessage.findMany).toHaveBeenCalledWith({
      where: { roomId: 'dm:u1:u2' },
      take: 50,
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }]
    })

    expect(result.map(m => m.id)).toEqual(['m1', 'm2'])
  })

  it('getRecentMessages should clamp limit to max 200', async () => {
    const db = new PrismaClient() as any
    const repo = new ChatRepositoryImpl(db)

    ;(db.chatMessage.findMany as jest.Mock).mockResolvedValue([])

    await repo.getRecentMessages('dm:u1:u2', 500)

    expect(db.chatMessage.findMany).toHaveBeenCalledWith({
      where: { roomId: 'dm:u1:u2' },
      take: 200,
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }]
    })
  })

  it('getRecentMessages should clamp limit to min 1', async () => {
    const db = new PrismaClient() as any
    const repo = new ChatRepositoryImpl(db)

    ;(db.chatMessage.findMany as jest.Mock).mockResolvedValue([])

    await repo.getRecentMessages('dm:u1:u2', 0)

    expect(db.chatMessage.findMany).toHaveBeenCalledWith({
      where: { roomId: 'dm:u1:u2' },
      take: 1,
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }]
    })
  })
})
