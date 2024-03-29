import TokenService from '../services/token.service'
import AuthService from '../services/auth.service'
import { prisma } from '../services/database.service'
import { ReasonPhrases, StatusCodes } from 'http-status-codes'
import { Request, Response } from 'express'

async function register(req: Request, res: Response) {
  const { username, password } = req.body

  const duplicate = await prisma.user.findFirst({ where: { username } })
  if (duplicate) return res.status(StatusCodes.CONFLICT).send({ error: StatusCodes.CONFLICT })

  try {
    const user = await prisma.user.create({
      data: {
        username,
        password
      }
    })

    res.locals.logger.info(`new account created for '${user.username}'`)
    res.locals.websocket.chat.userJoin(username)

    return res
      .status(StatusCodes.CREATED)
      .json({ message: ReasonPhrases.CREATED })
  } catch (err) {
    res.locals.logger.error(err)
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: ReasonPhrases.INTERNAL_SERVER_ERROR })
  }
}

async function login(req: Request, res: Response) {
  const { username, password } = req.body
  const user = await prisma.user.findFirst({ where: { username } })

  res.locals.logger.info(`'${username}' attempted login!`)

  if (!user || !AuthService.verifyUserPassword(user, password))
    return res.status(StatusCodes.UNAUTHORIZED).json({ error: ReasonPhrases.UNAUTHORIZED })

  res.locals.logger.info(`'${user.username}' just logged in!`)

  return res.json({
    token: TokenService.generateToken(user),
  })
}

const AuthController = {
  login,
  register
}

export default AuthController
