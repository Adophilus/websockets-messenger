import { NextFunction, Request, Response } from 'express'
import { Logger } from 'tslog'
import { TLog } from '../types'

export default function(appLogger: Logger<TLog>) {
  const logger = appLogger.getSubLogger({ name: 'LoggerMiddleware' })

  return (req: Request, res: Response, next: NextFunction) => {
    res.locals.logger = logger
    next()
  }
}
