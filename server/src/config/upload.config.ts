const UploadConfig = {
  path: 'public/uploads',
  allowedExtensions: ['jpeg', 'jpg', 'png', 'webm'],
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET,
  }
}

export default UploadConfig
