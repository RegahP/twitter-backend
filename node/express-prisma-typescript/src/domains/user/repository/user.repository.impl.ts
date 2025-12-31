import { SignupInputDTO } from '@domains/auth/dto'
import { PrismaClient, User } from '@prisma/client'
import { OffsetPagination } from '@types'
import { ExtendedUserDTO, UserDTO, UserViewDTO } from '../dto'
import { UserRepository } from './user.repository'

export class UserRepositoryImpl implements UserRepository {
  constructor (private readonly db: PrismaClient) {}

  async create (data: SignupInputDTO): Promise<UserDTO> {
    const user = await this.db.user.create({ data })
    return new UserDTO(user)
  }

  async getById (userId: string): Promise<UserDTO | null> {
    const user = await this.db.user.findUnique({
      where: {
        id: userId
      }
    })
    return user !== null ? new UserDTO(user) : null
  }

  async getByIdView (userId: string): Promise<UserViewDTO | null> {
    const user = await this.db.user.findUnique({
      where: {
        id: userId
      }
    })
    return user !== null ? new UserViewDTO(user) : null
  }

  async getByIdExtended (userId: string): Promise<ExtendedUserDTO | null> {
    const user = await this.db.user.findUnique({
      where: {
        id: userId
      }
    })
    return user !== null ? new ExtendedUserDTO(user) : null
  }

  async getByIdsExtended (userIds: string[]): Promise<ExtendedUserDTO[]> {
    if (userIds.length === 0) return []

    const users: User[] = await this.db.user.findMany({
      where: {
        id: { in: userIds }
      },
      orderBy: [{ id: 'asc' }]
    })

    return users.map(u => new ExtendedUserDTO(u))
  }

  async delete (userId: string): Promise<void> {
    await this.db.user.delete({
      where: {
        id: userId
      }
    })
  }

  async getRecommendedUsersPaginated (options: OffsetPagination): Promise<UserViewDTO[]> {
    const users: User[] = await this.db.user.findMany({
      take: options.limit ? options.limit : undefined,
      skip: options.skip ? options.skip : undefined,
      orderBy: [
        {
          id: 'asc'
        }
      ]
    })
    return users.map(user => new UserViewDTO(user))
  }

  async getByEmailOrUsername (email?: string, username?: string): Promise<ExtendedUserDTO | null> {
    const user = await this.db.user.findFirst({
      where: {
        OR: [
          {
            email
          },
          {
            username
          }
        ]
      }
    })
    return user !== null ? new ExtendedUserDTO(user) : null
  }

  async isPublicProfile (userId: string): Promise<boolean> {
    const user = await this.db.user.findUnique({
      where: {
        id: userId
      },
      select: {
        isPublic: true
      }
    })
    return user !== null ? user.isPublic : false
  }

  async setProfileImageKey (userId: string, key: string | null): Promise<UserDTO> {
    const user = await this.db.user.update({
      where: { id: userId },
      data: { profileImageKey: key }
    })
    return new UserDTO(user)
  }
}
