import { User } from 'generated/prisma/client'

export class UserDTO {
  constructor (user: User) {
    this.id = user.id
    this.name = user.name
    this.createdAt = user.createdAt
    this.isPublic = user.isPublic
  }

  id: string
  name: string | null
  createdAt: Date
  isPublic: boolean
}

export class ExtendedUserDTO extends UserDTO {
  constructor (user: User) {
    super(user)
    this.email = user.email
    this.name = user.name
    this.password = user.password
  }

  email!: string
  username!: string
  password!: string
}
export class UserViewDTO {
  constructor (user: UserViewDTO) {
    this.id = user.id
    this.name = user.name
    this.username = user.username
    this.profilePicture = user.profilePicture
  }

  id: string
  name: string
  username: string
  profilePicture: string | null
}
