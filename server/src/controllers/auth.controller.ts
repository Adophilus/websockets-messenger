import * as TokenService from '../services/token.service'
import * as AuthService from '../services/auth.service'
import { prisma } from '../services/database.service'
import { StatusCodes } from 'http-status-codes'
import { Request, Response } from 'express'

export async function register(req: Request, res: Response) {
  const { username, password } = req.body

  const duplicate = await prisma.user.findFirst({ where: { username } })
  if (duplicate) return res.sendStatus(StatusCodes.CONFLICT)

  try {
    await prisma.user.create({
      data: {
        username,
        password
      }
    })

    return res
      .status(StatusCodes.CREATED)
  } catch (err) {
    res.locals.logger.error(err)
    return res.sendStatus(StatusCodes.INTERNAL_SERVER_ERROR)
  }
}

export async function login(req: Request, res: Response) {
  const { username, password } = req.body
  const user = await prisma.user.findFirst({ where: { username } })

  if (!user || !AuthService.verifyUserPassword(user, password))
    return res.sendStatus(StatusCodes.UNAUTHORIZED)

  return res.json({
    token: TokenService.generateToken(user),
  })
}
