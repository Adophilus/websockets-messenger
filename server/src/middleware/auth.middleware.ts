import { NextFunction, Request, Response } from 'express'
import { checkSchema } from 'express-validator'
import { validationFunction } from '../utils/validation.util'

export const register = [
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

export const login = [
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
