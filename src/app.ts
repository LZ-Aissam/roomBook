import Fastify from 'fastify'
import { roomsRoutes } from './routes/rooms.ts'

export function buildApp() {
  const app = Fastify({ logger: true });

  app.get('/health', async () => { status:'ok' });
  app.register(roomsRoutes, { prefix: '/rooms' });
  
  return app;
}