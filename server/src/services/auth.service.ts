import { prisma } from "./database.service"
import { User } from '@prisma/client'

export function verifyUserPassword (user:User,password:string) {
  return (user.password === password)
}
