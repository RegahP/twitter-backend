import { User } from '@prisma/client'
import { buildS3PublicUrl } from '@utils'
import { IsNotEmpty, IsString } from 'class-validator'

export class UserDTO {
  constructor (user: User) {
    this.id = user.id
    this.name = user.name
    this.createdAt = user.createdAt
    this.isPublic = user.isPublic
    this.profileImageUrl = user.profileImageKey != null ? buildS3PublicUrl(user.profileImageKey) : null
  }

  id: string
  name: string | null
  createdAt: Date
  isPublic: boolean
  profileImageUrl: string | null
}

export class ExtendedUserDTO extends UserDTO {
  constructor (user: User) {
    super(user)
    this.email = user.email
    this.name = user.name
    this.username = user.username
    this.password = user.password
  }

  email!: string
  username!: string
  password!: string
}
export class UserViewDTO {
  constructor (user: User) {
    this.id = user.id
    this.name = user.name ?? 'Unknown'
    this.username = user.username
    this.profilePicture = user.profileImageKey != null ? buildS3PublicUrl(user.profileImageKey) : null
  }

  id: string
  name: string
  username: string
  profilePicture: string | null
}

export class CreateProfileImageUploadUrlDTO {
  @IsString()
  @IsNotEmpty()
    contentType!: string
}

export class SetProfileImageKeyDTO {
  @IsString()
  @IsNotEmpty()
    profileImageKey!: string
}
