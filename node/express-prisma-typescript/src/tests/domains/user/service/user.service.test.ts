import { UserServiceImpl } from '@domains/user/service'
import { UserRepository } from '@domains/user/repository'

describe('UserServiceImpl (happy paths)', () => {
  let repository: jest.Mocked<UserRepository>
  let service: UserServiceImpl

  beforeAll(() => {
    repository = {
      create: jest.fn(),
      getById: jest.fn(),
      getByIdView: jest.fn(),
      getByIdExtended: jest.fn(),
      getByIdsExtended: jest.fn(),
      delete: jest.fn(),
      getRecommendedUsersPaginated: jest.fn(),
      getByEmailOrUsername: jest.fn(),
      isPublicProfile: jest.fn(),
      setProfileImageKey: jest.fn()
    }

    service = new UserServiceImpl(repository)
  })

  it('getUser should return user', async () => {
    repository.getByIdView.mockResolvedValue({ id: 'u1' } as any)

    const result = await service.getUser('u1')
    expect(result.id).toBe('u1')
    expect(repository.getByIdView).toHaveBeenCalledWith('u1')
  })

  it('getUsersExtended should return users', async () => {
    repository.getByIdsExtended.mockResolvedValue([{ id: 'u1' }, { id: 'u2' }] as any)

    const result = await service.getUsersExtended(['u1', 'u2'])

    expect(result).toHaveLength(2)
    expect(repository.getByIdsExtended).toHaveBeenCalledWith(['u1', 'u2'])
  })

  it('getUserRecommendations should return users', async () => {
    repository.getRecommendedUsersPaginated.mockResolvedValue([
      { id: 'u2', name: 'n2', createdAt: new Date(), isPublic: true, profileImageUrl: null }
    ] as any)

    const result = await service.getUserRecommendations('u1', { limit: 10, skip: 0 })
    expect(result).toHaveLength(1)
    expect(repository.getRecommendedUsersPaginated).toHaveBeenCalledWith({ limit: 10, skip: 0 })
  })

  it('deleteUser should call repository.delete', async () => {
    repository.delete.mockResolvedValue(undefined)
    await service.deleteUser('u1')
    expect(repository.delete).toHaveBeenCalledWith('u1')
  })

  it('isPublicProfile should return boolean', async () => {
    repository.isPublicProfile.mockResolvedValue(true)
    const result = await service.isPublicProfile('u1')
    expect(result).toBe(true)
    expect(repository.isPublicProfile).toHaveBeenCalledWith('u1')
  })

  it('setProfileImageKey should return updated user', async () => {
    repository.setProfileImageKey.mockResolvedValue({
      id: 'u1',
      name: 'name',
      createdAt: new Date(),
      isPublic: true,
      profileImageUrl: 'https://public'
    } as any)

    const result = await service.setProfileImageKey('u1', 'users/u1/profile/a.png')
    expect(result.profileImageUrl).toBe('https://public')
    expect(repository.setProfileImageKey).toHaveBeenCalledWith('u1', 'users/u1/profile/a.png')
  })
})
