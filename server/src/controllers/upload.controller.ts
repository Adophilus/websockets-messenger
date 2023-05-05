import { prisma } from '../services/database.service'
import { ReasonPhrases, StatusCodes } from 'http-status-codes'
import { Request, Response } from 'express'
import { Logger, ILogObj } from 'tslog'
import StorageService from '@/services/storage.service'

async function uploadFiles(req: Request, res: Response) {
  const logger: Logger<ILogObj> = res.locals.logger

  const fileIds: (string | null)[] = []

  if (req.files) {
    if (Array.isArray(req.files)) {
      for (const file of req.files) {
        const fileUrl = await StorageService.uploadFile(file.path)
        if (fileUrl) {
          const media = await prisma.media.create({
            data: {
              url: fileUrl,
              mimetype: file.mimetype,
              size: file.size
            }
          })
          logger.trace(`Uploading file: ${file.path}`)
          fileIds.push(media.url)
        }
        else {
          logger.warn(`Failed to upload file: ${file.path}`)
          fileIds.push(null)
        }
      }
    }
  }

  return res.status(StatusCodes.OK).json({
    message: 'Uploaded successfully',
    files: fileIds
  })
}

const UploadController = {
  uploadFiles
}

export default UploadController
