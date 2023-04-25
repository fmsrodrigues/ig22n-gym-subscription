import { prisma } from '@/lib/prisma'
import { hash } from 'bcryptjs'

interface RegisterUserCaseRequest {
  name: string
  email: string
  password: string
}

export async function registerUseCase({
  name,
  email,
  password,
}: RegisterUserCaseRequest) {
  const password_hash = await hash(password, 6)

  const userWithSameEmail = await prisma.user.findUnique({
    where: {
      email,
    },
  })
  if (userWithSameEmail) {
    throw new Error('Email already in use')
  }

  await prisma.user.create({
    data: {
      name,
      email,
      password_hash,
    },
  })
}
