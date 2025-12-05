export class FollowDTO {
  constructor (follow: FollowDTO) {
    this.id = follow.id
    this.followerId = follow.followerId
    this.followedId = follow.followedId
    this.createdAt = follow.createdAt
    this.updatedAt = follow.updatedAt
    this.deletedAt = follow.deletedAt
  }

  id: string
  followerId: string
  followedId: string
  createdAt: Date
  updatedAt: Date
  deletedAt: Date | null
}

export class FollowInputDTO {
  constructor (data: FollowInputDTO) {
    this.followerId = data.followerId
    this.followedId = data.followedId
  }

  followerId: string
  followedId: string
}
