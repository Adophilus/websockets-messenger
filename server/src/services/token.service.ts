import jwt from 'jsonwebtoken'
import config from '../config'
import { User } from '@prisma/client'
import { TToken } from '../types'

function generateToken(user: User) {
  return jwt.sign({ username: user.username } as TToken, config.jwt.tokenSecret, {
    expiresIn: '1d'
  })
}

function verifyToken(token: string) {
  return jwt.verify(token, config.jwt.tokenSecret)
}

export default {
  generateToken,
  verifyToken
}
