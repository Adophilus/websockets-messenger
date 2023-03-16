import { checkSchema } from 'express-validator'
import { validationFunction } from '../utils/validation.util'

export const register = [
  checkSchema({
    username: {
      in: ['body']
    },
    password: {
      in: ['body']
    }
  }),
  validationFunction
]

export const login = [
  checkSchema({
    username: {
      in: ['body']
    },
    password: {
      in: ['body']
    }
  }),
  validationFunction
]
