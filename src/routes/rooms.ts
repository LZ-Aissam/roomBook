import type {  FastifyPluginAsync } from 'fastify'

type Room = {
    id: number;
    name: string;
    capacity: number;
};

let rooms: Room[] = [
    { id: 1, name: 'A101', capacity: 30 },
    { id: 2, name: 'Toto', capacity: 12 },
];

let nextId = 3;

export const roomsRoutes: FastifyPluginAsync = async (app) => {
    app.get('/', async () => rooms);

    app.get<{ Params: { id: string } }>('/:id', async (request, reply) => {
        const room = rooms.find((r) => r.id === parseInt(request.params.id));
        if (!room) return reply.status(404).send({ error: 'Room not found' });
        return room;
    });

    app.post<{ Body: { name: string; capacity: number } }>('/', async (request, reply) => {
        const { name, capacity } = request.body;
        const newRoom: Room = { id: nextId++, ...request.body };
        rooms.push(newRoom);
        return reply.status(201).send(newRoom);
    });

    app.delete<{ Params: { id: string } }>('/:id', async (request, reply) => {
        const room = rooms.findIndex((r) => r.id === parseInt(request.params.id));
        if (!room) return reply.status(404).send({ error: 'Room not found' });
        rooms = rooms.filter((r) => r.id !== parseInt(request.params.id));
        return reply.status(204).send({ error: 'Room deleted' });
    })
}