import type {  FastifyPluginAsync } from 'fastify'
import type { TypeBoxTypeProvider } from '@fastify/type-provider-typebox';
import { Room, RoomBody, RoomType } from '../schema/rooms.ts';
import { Type } from 'typebox';


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
    const typed = app.withTypeProvider<TypeBoxTypeProvider>();


    typed.get('/', { schema: { querystring:  Type.Object({ minCapacity: Type.Optional(Type.Integer({ minimum: 1 })), }), } }, async (request, reply) => {
        const { minCapacity } = request.query;
        if (minCapacity) {
            return rooms.filter((r) => r.capacity >= minCapacity);
        }
        return rooms;
    });

    typed.get('/:id', { schema: { params: Type.Object({ id: Type.String({minLength: 1}) }), response: { 200: Room, 404: Type.Object({ error: Type.String(), }) } } }, async (request, reply) => {
        const { id } = request.params;
        const room = rooms.find((r) => r.id === Number(id));
        if (!room) return reply.code(404).send({ error: 'Room not found' });
        return room;
    });

    typed.post('/', { schema: { body: RoomBody } }, async (request, reply) => {
        const room: RoomType = {
            id: nextId,
            ...request.body
        }
        rooms.push(room);
        nextId++
        return reply.code(201).send(room);
    });

    typed.patch('/:id', { schema: { params: Type.Object({ id: Type.String({minLength: 1}) }), body: Type.Partial(RoomBody), response: { 200: Room, 404: Type.Object({ error: Type.String(), }) } } }, async (request, reply) => {
        const room = rooms.find((r) => r.id === Number(request.params.id));
        if (!room) return reply.code(404).send({ error: 'Room not found' });
        Object.assign(room, request.body);
        return room;
    });

    // app.get<{ Params: { id: string } }>('/:id', async (request, reply) => {
    //     const room = rooms.find((r) => r.id === parseInt(request.params.id));
    //     if (!room) return reply.code(404).send({ error: 'Room not found' });
    //     return room;
    // });

    // app.post<{ Body: { name: string; capacity: number } }>('/', async (request, reply) => {
    //     const { name, capacity } = request.body;
    //     const newRoom: Room = { id: nextId++, ...request.body };
    //     rooms.push(newRoom);
    //     return reply.code(201).send(newRoom);
    // });

    app.delete<{ Params: { id: string } }>('/:id', async (request, reply) => {
        const room = rooms.findIndex((r) => r.id === parseInt(request.params.id));
        if (!room) return reply.code(404).send({ error: 'Room not found' });
        rooms = rooms.filter((r) => r.id !== parseInt(request.params.id));
        return reply.code(204).send({ error: 'Room deleted' });
    })
}