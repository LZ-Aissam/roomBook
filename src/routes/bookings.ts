import type { FastifyPluginAsync } from 'fastify'
import type { TypeBoxTypeProvider } from '@fastify/type-provider-typebox';
import { Type } from 'typebox';
import { Booking, BookingBody, BookingParams, type BookingType } from '../schema/bookings.ts';
import { ErrorSchema } from '../schema/errors.ts';
import { HttpError } from '../plugins/errors.ts';

export const BookingRoutes: FastifyPluginAsync = async (app) => {
    const typed = app.withTypeProvider<TypeBoxTypeProvider>();
    const prisma = app.prisma;

    typed.get('/', {
        schema: {
            tags: ['bookings'],
            summary: 'Lister les réservations',
            response: { 200: Type.Array(Booking) },
        },
    }, async () => {
        return prisma.booking.findMany({
            include: {
                room: true,
            },
            orderBy: {
                startsAt: 'asc',
            },
        });
    });

    typed.get('/:id', {
        schema: {
            tags: ['bookings'],
            summary: 'Obtenir une réservation',
            params: BookingParams,
            response: { 200: Booking, 404: ErrorSchema },
        },
    }, async (request) => {
        const booking = await prisma.booking.findUnique({
            where: {
                id: Number(request.params.id),
            },
        });
        if (!booking) throw new HttpError(404, 'La réservation est introuvable');
        return booking;
    });

    typed.post('/', {
        schema: {
            tags: ['bookings'],
            summary: 'Créer une réservation',
            body: BookingBody,
            response: { 201: Booking, 400: ErrorSchema, 404: ErrorSchema },
        },
    }, async (request, reply) => {
        const booking = await prisma.booking.create({
            data: request.body,
        });
        const conflict = await prisma.booking.findFirst({
            where: {
                roomId: booking.roomId,
                startsAt: {
                    lte: booking.endsAt,
                },
                endsAt: {
                    gte: booking.startsAt,
                },
            },
        });
        if (conflict) throw new HttpError(400, 'La réservation existe déjà pour cette salle et cette période');
        return reply.code(201).send(booking);
    });

    typed.patch('/:id', {
        schema: {
            tags: ['bookings'],
            summary: 'Modifier une réservation',
            params: BookingParams,
            body: Type.Partial(BookingBody),
            response: { 200: Booking, 400: ErrorSchema, 404: ErrorSchema },
        },
    }, async (request) => {
        return await prisma.$transaction(async (tx) => {
            const booking = await tx.booking.findUnique({
                where: { id: Number(request.params.id) },
            });
            if (!booking) throw new HttpError(404, 'La réservation est introuvable');
            const startsAt = new Date(request.body.startsAt ?? booking.startsAt);
            const endsAt = new Date(request.body.endsAt ?? booking.endsAt);
            const roomId = request.body.roomId ?? booking.roomId;
            if (endsAt <= startsAt) throw new HttpError(400, 'La date de fin doit être après la date de début');
            const conflict = await tx.booking.findFirst({
                where: {
                    roomId,
                    id: { not: booking.id },
                    startsAt: { lte: endsAt },
                    endsAt: { gte: startsAt },
                },
            });
            if (conflict) throw new HttpError(400, 'La réservation existe déjà pour cette salle et cette période');
            return await tx.booking.update({
                where: { id: booking.id },
                data: {
                    startsAt,
                    endsAt,
                    roomId,
                },
            });
        });
    });

    typed.delete('/:id', {
        schema: {
            tags: ['bookings'],
            summary: 'Supprimer une réservation',
            params: BookingParams,
            response: { 204: Booking, 404: ErrorSchema },
        },
    }, async (request, reply) => {
        const booking = await prisma.booking.delete({
            where: {
                id: Number(request.params.id),
            },
        });
        if (!booking) throw new HttpError(404, 'La réservation est introuvable');
        return reply.code(204).send(booking);
    });
}
