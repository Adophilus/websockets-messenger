import { NextFunction, Request, Response } from 'express'
import { checkSchema } from 'express-validator'
import { validationFunction } from '../utils/validation.util'
import TokenService from '../services/token.service'
import { ReasonPhrases, StatusCodes } from 'http-status-codes'

const register = [
  (req: Request, res: Response, next: NextFunction) => {
    res.locals.logger.info(req.body)
    next()
  },
  checkSchema({
    username: {
      in: ['body'],
      isString: true
    },
    password: {
      in: ['body'],
      isString: true
    }
  }),
  validationFunction
]

const login = [
  checkSchema({
    username: {
      in: ['body'],
      isString: true
    },
    password: {
      in: ['body'],
      isString: true
    }
  }),
  validationFunction
]

function isAuthenticated(req: Request, res: Response, next: NextFunction) {
  if (!req.headers)
    return res.status(StatusCodes.FORBIDDEN).send({ error: ReasonPhrases.FORBIDDEN })
  if (!req.headers['authorization'])
    return res.status(StatusCodes.FORBIDDEN).send({ error: ReasonPhrases.FORBIDDEN })

  const token = String(req.headers['authorization']).split(' ')[1]
  const jwt = TokenService.verifyToken(token)
  if (!jwt)
    return res.status(StatusCodes.FORBIDDEN).send({ error: ReasonPhrases.FORBIDDEN })

  res.locals.token = jwt

  next()
}

const AuthMiddleware = {
  login,
  register,
  isAuthenticated
}

export default AuthMiddleware
