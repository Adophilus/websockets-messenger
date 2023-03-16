import jwt from 'jsonwebtoken'
import config from '../config'
import { User } from '@prisma/client'

export function generateToken(user: User) {
  return jwt.sign({ username: user.username }, config.jwt.tokenSecret, {
    expiresIn: '1d'
  })
}

export async function verifyToken(token: string) {
  return jwt.verify(token, config.jwt.tokenSecret)
}
