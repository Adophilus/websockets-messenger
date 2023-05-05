import { Request, Response } from "express";
import { ReasonPhrases, StatusCodes } from "http-status-codes";

export default async function ErrorHandlerMiddleware(err: Error, req: Request, res: Response) {
  res.locals.logger.warn("An error occurred:", err)
  res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: ReasonPhrases.INTERNAL_SERVER_ERROR })
}
