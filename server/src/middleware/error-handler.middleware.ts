import { NextFunction, Request, Response } from "express";
import { ReasonPhrases, StatusCodes } from "http-status-codes";
import { MulterError } from "multer";

export default async function ErrorHandlerMiddleware(err: Error, req: Request, res: Response, next: NextFunction) {
  const { logger } = res.locals

  if (err instanceof MulterError) {
    logger.warn("File upload error:", err.message)
    logger.error("Full error details:", err)
  }
  else {
    logger.error("An error occurred:", err)
  }
  res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: ReasonPhrases.INTERNAL_SERVER_ERROR })
}
