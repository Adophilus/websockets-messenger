import { User } from '@prisma/client'

function verifyUserPassword(user: User, password: string) {
  return (user.password === password)
}

export default {
  verifyUserPassword
}
