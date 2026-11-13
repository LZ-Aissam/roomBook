import type { FastifyPluginAsync } from 'fastify'
import type { TypeBoxTypeProvider } from '@fastify/type-provider-typebox';
import { Type } from 'typebox';
import { Room, RoomBody, type RoomType } from '../schema/rooms.ts';
import { ErrorSchema } from '../schema/errors.ts';
import { HttpError } from '../plugins/errors.ts';

const RoomParams = Type.Object({
    id: Type.String({ minLength: 1, description: 'Identifiant de la salle', examples: ['1'] }),
});

export const roomsRoutes: FastifyPluginAsync = async (app) => {
    const typed = app.withTypeProvider<TypeBoxTypeProvider>();
    const {prisma} = app

    typed.get('/', {
        schema: {
            tags: ['rooms'],
            summary: 'Lister les salles',
            querystring: Type.Object({
                minCapacity: Type.Optional(Type.Integer({ minimum: 1, description: 'Capacité minimale' })),
            }),
            response: { 200: Type.Array(Room), 400: ErrorSchema },
        },
    }, async (request) => {
        const { minCapacity } = request.query;
        return prisma.room.findMany({
            where: minCapacity ? { capacity: { gte: minCapacity } } : undefined,
            orderBy: { name: 'asc' },
        })
    });

    typed.get('/:id', {
        schema: {
            tags: ['rooms'],
            summary: 'Obtenir une salle',
            params: RoomParams,
            response: { 200: Room, 404: ErrorSchema },
        },
    }, async (request) => {
        const room = await prisma.room.findUnique({
            where:{
                id: Number(request.params.id),
            },
        });
        if (!room) throw new HttpError(404, "Salle introuvable");
    });

    typed.post('/', {
        schema: {
            tags: ['rooms'],
            summary: 'Créer une salle',
            body: RoomBody,
            response: { 201: Room, 400: ErrorSchema },
        },
    }, async (request, reply) => {
        const room = await prisma.room.create({
            data: request.body,
        })
        return reply.code(201).send(room);
    });

    typed.patch('/:id', {
        schema: {
            tags: ['rooms'],
            summary: 'Modifier une salle',
            params: RoomParams,
            body: Type.Partial(RoomBody),
            response: { 200: Room, 400: ErrorSchema, 404: ErrorSchema },
        },
    }, async (request) => {
        const room = await prisma.room.update({
            where: {
                id: Number(request.params.id),
            },
            data: request.body,
        });
        return room;
    });

    typed.delete('/:id', {
        schema: {
            tags: ['rooms'],
            summary: 'Supprimer une salle',
            params: RoomParams,
            response: { 204: Type.Null({ description: 'Salle supprimée' }), 404: ErrorSchema },
        },
    }, async (request, reply) => {
        const room = await prisma.room.delete({
            where: {
                id: Number(request.params.id),
            },
        })
        return reply.code(204).send(null);
    });
}
