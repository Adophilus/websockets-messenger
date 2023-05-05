import multer from 'multer'
import os from 'os'

const upload = multer({ dest: os.tmpdir() });

const uploadFiles = upload.array('files', 4)

const UploadMiddleware = {
  uploadFiles
}

export default UploadMiddleware
