import { Logger } from "tslog"
import { Media } from "../types"
import { v4 as uuidv4 } from 'uuid'
import config from '../config'
import path from 'path'
import fs from 'fs/promises'
import cloudinary from 'cloudinary'

const logger = new Logger({ name: 'StorageService' })
const storage = cloudinary.v2
storage.config({
  cloud_name: config.upload.cloudinary.cloudName,
  api_key: config.upload.cloudinary.apiKey,
  api_secret: config.upload.cloudinary.apiSecret
})

const uploadAsync = (buffer: Buffer) => {
  return new Promise((resolve, reject) => {
    storage.uploader.upload_stream({ resource_type: 'image' }, (error, res) => {
      if (error) {
        reject(error)
        return
      }

      resolve(res)
    }).end(buffer)
  })
}

export default {
  async upload(media: Media) {
    logger.info(`uploading media: ${media.name}`)
    const buffer = Buffer.from(media.data, "base64")
    const fileExtension = media.mimetype.split("/")[1]

    if (!config.upload.allowedExtensions.includes(fileExtension)) {
      return null
    }

    const fileName = `${uuidv4()}.${fileExtension}`
    const filePath = path.join(config.upload.path, fileName)
    await fs.writeFile(filePath, buffer, { encoding: 'utf8' })

    const res = await uploadAsync(buffer)
    logger.info('res:', res)

    return filePath
  },
  async remove(mediaPath: string) {
    const filePath = path.join(config.upload.path, mediaPath)
    if (await fs.stat(filePath)) {
      await fs.unlink(filePath)
    }
  }
}
