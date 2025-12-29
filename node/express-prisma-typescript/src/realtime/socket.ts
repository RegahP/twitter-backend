import type http from 'http'
import { Server } from 'socket.io'
import jwt from 'jsonwebtoken'

import { Constants, Logger, UnauthorizedException, db } from '@utils'

import { ChatRepositoryImpl } from '@domains/chat/repository'
import { ChatServiceImpl, createChatRoomId } from '@domains/chat/service'
import { FollowerRepositoryImpl } from '@domains/follower/repository'
import type { ChatJoinInput, ChatSendMessageInput } from '@domains/chat/dto'

const getTokenFromSocket = (socket: any): string | null => {
  const authToken = socket.handshake?.auth?.token
  if (typeof authToken === 'string' && authToken.length > 0) return authToken

  const header = socket.handshake?.headers?.authorization
  if (typeof header === 'string') {
    const [bearer, token] = header.split(' ')
    if (bearer === 'Bearer' && token) return token
  }

  return null
}

export const attachSocketServer = (server: http.Server): Server => {
  const io = new Server(server, {
    cors: {
      origin: Constants.CORS_WHITELIST
    }
  })

  const chatService = new ChatServiceImpl(
    new ChatRepositoryImpl(db),
    new FollowerRepositoryImpl(db)
  )

  io.use((socket, next) => {
    const token = getTokenFromSocket(socket)
    if (!token) return next(new UnauthorizedException('MISSING_TOKEN'))

    try {
      const context = jwt.verify(token, Constants.TOKEN_SECRET) as any
      const userId = context?.userId
      if (typeof userId !== 'string' || userId.length === 0) {
        return next(new UnauthorizedException('INVALID_TOKEN'))
      }

      socket.data.userId = userId
      next()
    } catch (err) {
      next(new UnauthorizedException('INVALID_TOKEN'))
    }
  })

  io.on('connection', socket => {
    const userId: string = socket.data.userId

    socket.on('chat:join', async (input: ChatJoinInput, ack?: (payload: any) => void) => {
      try {
        const roomId = createChatRoomId(userId, input.peerUserId)
        const messages = await chatService.getHistory(userId, input.peerUserId, input.limit)

        await socket.join(roomId)
        socket.emit('chat:history', { roomId, messages })
        ack?.({ ok: true, roomId })
      } catch (err) {
        ack?.({ ok: false })
        socket.emit('chat:error', { message: 'FORBIDDEN' })
      }
    })

    socket.on('chat:message', async (input: ChatSendMessageInput, ack?: (payload: any) => void) => {
      try {
        const msg = await chatService.sendMessage(userId, input)
        io.to(msg.roomId).emit('chat:message', msg)
        ack?.({ ok: true, message: msg })
      } catch (err) {
        ack?.({ ok: false })
        socket.emit('chat:error', { message: 'FORBIDDEN' })
      }
    })

    socket.on('error', err => {
      Logger.warn(String(err))
    })
  })

  return io
}
