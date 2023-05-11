import { InMemoryCheckInsRepository } from '@/repositories/in-memory/in-memory-check-ins-repository'
import { InMemoryGymsRepository } from '@/repositories/in-memory/in-memory-gyms-repository'
import { Decimal } from '@prisma/client/runtime/library'
import { describe, expect, it, beforeEach, vi, afterEach } from 'vitest'
import { CheckInUseCase } from './check-in'

let checkInsRepository: InMemoryCheckInsRepository
let gymsRepository: InMemoryGymsRepository
let sut: CheckInUseCase

describe('CheckIn Use Case', () => {
  beforeEach(() => {
    checkInsRepository = new InMemoryCheckInsRepository()
    gymsRepository = new InMemoryGymsRepository()
    sut = new CheckInUseCase(checkInsRepository, gymsRepository)

    gymsRepository.items.push({
      id: 'gym-id',
      title: 'Gym',
      description: 'Gym description',
      phone: '123456789',
      latitude: new Decimal(-27.209205),
      longitude: new Decimal(-49.640109),
      created_at: new Date(),
    })

    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should be able to check in', async () => {
    const { checkIn } = await sut.execute({
      gymId: 'gym-id',
      userId: 'user-id',
      userLatitude: -27.209205,
      userLongitude: -49.640109,
    })

    expect(checkIn.id).toEqual(expect.any(String))
  })

  it('should not be able to check in twice in the same day', async () => {
    vi.setSystemTime(new Date('2022-01-20T10:00:00'))

    await sut.execute({
      gymId: 'gym-id',
      userId: 'user-id',
      userLatitude: -27.209205,
      userLongitude: -49.640109,
    })

    await expect(() =>
      sut.execute({
        gymId: 'gym-id',
        userId: 'user-id',
        userLatitude: -27.209205,
        userLongitude: -49.640109,
      }),
    ).rejects.toBeInstanceOf(Error)
  })

  it('should be able to check in twice in different days', async () => {
    vi.setSystemTime(new Date('2022-01-20T10:00:00'))

    await sut.execute({
      gymId: 'gym-id',
      userId: 'user-id',
      userLatitude: -27.209205,
      userLongitude: -49.640109,
    })

    vi.setSystemTime(new Date('2022-01-21T10:00:00'))

    const { checkIn } = await sut.execute({
      gymId: 'gym-id',
      userId: 'user-id',
      userLatitude: -27.209205,
      userLongitude: -49.640109,
    })

    expect(checkIn.id).toEqual(expect.any(String))
  })

  it('should not be able to check in on distant gym', async () => {
    gymsRepository.items.push({
      id: 'gym-id2',
      title: 'Gym',
      description: 'Gym description',
      phone: '123456789',
      latitude: new Decimal(-27.059205),
      longitude: new Decimal(-49.400109),
      created_at: new Date(),
    })

    await expect(() =>
      sut.execute({
        gymId: 'gym-id',
        userId: 'user-id',
        userLatitude: -27.204225,
        userLongitude: -49.640449,
      }),
    ).rejects.toBeInstanceOf(Error)
  })
})
