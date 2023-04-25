import fastify from 'fastify'
import { ZodError } from 'zod'
import { env } from './env'
import { appRoutes } from './http/routes'

export const app = fastify()

app.register(appRoutes)

app.setErrorHandler((err, _, reply) => {
  if (err instanceof ZodError) {
    return reply
      .status(400)
      .send({ message: 'Validation error', issues: err.format() })
  }

  if (env.NODE_ENV !== 'production') {
    console.error(err)
  } else {
    // TODO: Send error to Sentry/DataDog/NewRelic
  }

  return reply.status(500).send({ message: 'Internal server error' })
})
