import TokenService from '../services/token.service'
import AuthService from '../services/auth.service'
import { prisma } from '../services/database.service'
import { ReasonPhrases, StatusCodes } from 'http-status-codes'
import { Request, Response } from 'express'

async function uploadFiles(req: Request, res: Response) {
  console.log(req.files)
  return res.status(StatusCodes.OK).json({
    message: 'Uploaded successfully'
  })
}

const UploadController = {
  uploadFiles
}

export default UploadController
