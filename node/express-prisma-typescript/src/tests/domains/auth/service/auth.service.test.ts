import { AuthServiceImpl } from '@domains/auth/service'
import { LoginInputDTO, SignupInputDTO } from '@domains/auth/dto'
import { UserRepository } from '@domains/user/repository'
import { encryptPassword } from '@utils'

describe('AuthServiceImpl (happy paths)', () => {
  let repository: jest.Mocked<UserRepository>
  let service: AuthServiceImpl

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

    service = new AuthServiceImpl(repository)
  })

  beforeEach(() => {
    jest.restoreAllMocks()
  })

  it('signup should create user and return token', async () => {
    repository.getByEmailOrUsername.mockResolvedValue(null)
    repository.create.mockResolvedValue({
      id: 'user-1',
      name: null,
      createdAt: new Date(),
      isPublic: true,
      profileImageUrl: null
    } as any)

    const input = new SignupInputDTO('test@example.com', 'testuser', 'Str0ngP@ssw0rd!')
    const result = await service.signup(input)

    expect(typeof result.token).toBe('string')
    expect(result.token.length).toBeGreaterThan(0)
    expect(repository.getByEmailOrUsername).toHaveBeenCalledWith(input.email, input.username)
    expect(repository.create).toHaveBeenCalled()
  })

  it('login should return token', async () => {
    const hashed = await encryptPassword('Str0ngP@ssw0rd!')

    repository.getByEmailOrUsername.mockResolvedValue({
      id: 'user-1',
      email: 'test@example.com',
      username: 'testuser',
      password: hashed,
      name: null,
      createdAt: new Date(),
      isPublic: true,
      profileImageUrl: null
    } as any)

    const input: LoginInputDTO = { email: 'test@example.com', password: 'Str0ngP@ssw0rd!' }
    const result = await service.login(input)

    expect(typeof result.token).toBe('string')
    expect(result.token.length).toBeGreaterThan(0)
    expect(repository.getByEmailOrUsername).toHaveBeenCalledWith(input.email, input.username)
  })
})
