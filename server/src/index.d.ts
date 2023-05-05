import 'express';
import { ILogObj, Logger } from 'tslog';
import type { TToken } from './types'

declare global {
  namespace Express {
    interface Locals {
      logger: Logger<ILogObj>
      token?: TToken
    }
  }
}
