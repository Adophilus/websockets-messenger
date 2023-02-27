import { PrismaClient } from '@prisma/client'

export const prisma = new PrismaClient()

export const init = () => {

}

export const disconnect = async () => {
  await prisma.$disconnect()
}

export default { init, disconnect }
