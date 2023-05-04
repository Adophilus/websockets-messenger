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
  return new Promise<string>((resolve, reject) => {
    storage.uploader.upload_stream({ resource_type: 'image' }, (error, res) => {
      if (error) {
        reject(error)
        return
      }

      if (!res) {
        reject(new Error('Upload failed!'))
        return
      }

      resolve(res.url)
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

    try {
      return await uploadAsync(buffer)
    }
    catch (err) {
      logger.warn('Media upload failed!', err)
      return null
    }
  },
  async remove(mediaPath: string) {
    const filePath = path.join(config.upload.path, mediaPath)
    if (await fs.stat(filePath)) {
      await fs.unlink(filePath)
    }
  }
}
