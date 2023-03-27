import jwt, { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken'
import config from '../config'
import { User } from '@prisma/client'
import { TToken } from '../types'

function generateToken(user: User) {
  return jwt.sign({ username: user.username } as TToken, config.jwt.tokenSecret, {
    expiresIn: '1d'
  })
}

function verifyToken(token: string): TToken | null {
  try {
    return jwt.verify(token, config.jwt.tokenSecret) as TToken
  }
  catch (err) {
    if (err instanceof TokenExpiredError)
      return null
    else if (err instanceof JsonWebTokenError)
      return null
    throw err
  }
}

export default {
  generateToken,
  verifyToken
}
