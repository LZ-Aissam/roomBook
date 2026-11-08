import type { FastifyPluginAsync } from 'fastify'
import type { TypeBoxTypeProvider } from '@fastify/type-provider-typebox';
import { Type } from 'typebox';
import { Booking, BookingBody, type BookingType } from '../schema/bookings.ts';
import { ErrorSchema } from '../schema/errors.ts';
import { HttpError } from '../plugins/errors.ts';
import { roomExists } from './rooms.ts';

let Bookings: BookingType[] = [
    { id: 1, userId: 'toto', startsAt: '2026-01-01', endsAt: '2026-01-02', roomId: 1 },
    { id: 2, userId: 'tata', startsAt: '2026-01-01', endsAt: '2026-01-02', roomId: 2 },
];

let nextId = 3;

const BookingParams = Type.Object({
    id: Type.String({ minLength: 1, description: 'Identifiant de la réservation', examples: ['1'] }),
});

function checkBooking(booking: Omit<BookingType, 'id'>) {
    if (!roomExists(booking.roomId)) throw new HttpError(404, 'Room not found');
    if (booking.endsAt <= booking.startsAt) throw new HttpError(400, 'endsAt must be after startsAt');
}

export const BookingRoutes: FastifyPluginAsync = async (app) => {
    const typed = app.withTypeProvider<TypeBoxTypeProvider>();

    typed.get('/', {
        schema: {
            tags: ['bookings'],
            summary: 'Lister les réservations',
            response: { 200: Type.Array(Booking) },
        },
    }, async () => {
        return Bookings;
    });

    typed.get('/:id', {
        schema: {
            tags: ['bookings'],
            summary: 'Obtenir une réservation',
            params: BookingParams,
            response: { 200: Booking, 404: ErrorSchema },
        },
    }, async (request) => {
        const booking = Bookings.find((b) => b.id === Number(request.params.id));
        if (!booking) throw new HttpError(404, 'Booking not found');
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
        checkBooking(request.body);
        const booking: BookingType = { id: nextId++, ...request.body };
        Bookings.push(booking);
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
        const booking = Bookings.find((b) => b.id === Number(request.params.id));
        if (!booking) throw new HttpError(404, 'Booking not found');
        checkBooking({ ...booking, ...request.body });
        Object.assign(booking, request.body);
        return booking;
    });

    typed.delete('/:id', {
        schema: {
            tags: ['bookings'],
            summary: 'Supprimer une réservation',
            params: BookingParams,
            response: { 204: Type.Null({ description: 'Réservation supprimée' }), 404: ErrorSchema },
        },
    }, async (request, reply) => {
        const booking = Bookings.find((b) => b.id === Number(request.params.id));
        if (!booking) throw new HttpError(404, 'Booking not found');
        Bookings = Bookings.filter((b) => b.id !== Number(request.params.id));
        return reply.code(204).send(null);
    });
}
