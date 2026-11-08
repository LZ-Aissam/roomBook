import fp from 'fastify-plugin';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';

export default fp(async (app) => {
    await app.register(swagger, {
        openapi: {
            info: { title: 'RoomBook', version: '1.0.0' },
            tags: [
                { name: 'rooms', description: 'Gestion des salles' },
                { name: 'bookings', description: 'Gestion des réservations' },
            ],
        },
    });
    await app.register(swaggerUi, { routePrefix: '/docs' });
});
