export class ReactionDTO {
  constructor (reaction: ReactionDTO) {
    this.id = reaction.id
    this.userId = reaction.userId
    this.postId = reaction.postId
    this.type = reaction.type
    this.createdAt = reaction.createdAt
  }

  id: string
  userId: string
  postId: string
  type: 'like' | 'retweet'
  createdAt: Date
}

export class ReactionInputDTO {
  constructor (data: ReactionInputDTO) {
    this.postId = data.postId
    this.type = data.type
  }

  postId: string
  type: 'like' | 'retweet'
}
