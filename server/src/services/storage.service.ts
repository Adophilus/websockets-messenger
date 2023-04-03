import { Logger } from "tslog"
import { Media } from "../types"
import { v4 as uuidv4 } from 'uuid'
import config from '../config'
import path from 'path'
import fs from 'fs'

const logger = new Logger({ name: 'StorageService' })

export default {
  upload(media: Media): String | null {
    logger.info(`uploading media: ${media.name}`)
    const buffer = Buffer.from(media.data, "base64")
    const fileExtension = media.mimetype.split("/")[1]

    if (!config.upload.allowedExtensions.includes(fileExtension)) {
      return null
    }

    const fileName = `${uuidv4()}.${fileExtension}`
    const filePath = path.join(config.upload.path, fileName)
    fs.createWriteStream(filePath).write(buffer)

    return filePath
  }
}
