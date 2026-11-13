import Fastify from 'fastify'
import { roomsRoutes } from './routes/rooms.ts'
import { BookingRoutes } from './routes/bookings.ts'
import errors from './plugins/errors.ts'
import swagger from './plugins/swagger.ts'
import prisma from './plugins/prisma.ts'

export function buildApp() {
  const app = Fastify({ logger: true });

  app.register(errors);
  app.register(swagger);
  app.register(prisma);

  app.register(async (app) => {
    app.get('/health', { schema: { tags: ['health'], summary: 'Vérifier que le serveur répond' } }, async () => ({ status: 'ok' }));
  });
  app.register(roomsRoutes, { prefix: '/rooms' });
  app.register(BookingRoutes, { prefix: '/bookings' });

  return app;
}
