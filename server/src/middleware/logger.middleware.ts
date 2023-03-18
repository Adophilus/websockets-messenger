import { NextFunction, Request, Response } from 'express'
import { ILogObj, Logger } from 'tslog'

export default function(appLogger: Logger<ILogObj>) {
  const logger = appLogger.getSubLogger({ name: 'LoggerMiddleware' })

  return (req: Request, res: Response, next: NextFunction) => {
    res.locals.logger = logger
    next()
  }
}
