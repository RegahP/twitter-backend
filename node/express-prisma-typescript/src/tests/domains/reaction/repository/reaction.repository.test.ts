import { PrismaClient } from '@prisma/client'

import { ReactionRepositoryImpl } from '@domains/reaction/repository'
import { ReactionInputDTO } from '@domains/reaction/dto'

describe('ReactionRepositoryImpl (happy paths)', () => {
  it('react should create reaction and return DTO', async () => {
    const db = new PrismaClient() as any
    const repo = new ReactionRepositoryImpl(db)

    const data = new ReactionInputDTO({ postId: 'p1', type: 'like' } as any)
    const reactionRecord = { id: 'r1', userId: 'u1', postId: 'p1', type: 'like', createdAt: new Date() };
    (db.reaction.create as jest.Mock).mockResolvedValue(reactionRecord)

    const result = await repo.react('u1', data)
    expect(db.reaction.create).toHaveBeenCalled()
    expect(result).toMatchObject({ id: 'r1', userId: 'u1', postId: 'p1', type: 'like' })
  })

  it('deleteReaction should delete by composite key', async () => {
    const db = new PrismaClient() as any
    const repo = new ReactionRepositoryImpl(db)

    const data = new ReactionInputDTO({ postId: 'p1', type: 'like' } as any);
    (db.reaction.delete as jest.Mock).mockResolvedValue({ id: 'r1' })

    await repo.deleteReaction('u1', data)
    expect(db.reaction.delete).toHaveBeenCalled()
  })
})
