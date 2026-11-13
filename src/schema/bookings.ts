import { Type, Static } from "@fastify/type-provider-typebox";

export const BookingBody = Type.Object({
    userId: Type.String({ minLength: 1, description: "Identifiant de l'utilisateur", examples: ['toto'] }),
    startsAt: Type.Unsafe<Date>({ type: 'string', format: 'date-time', description: 'Date de début', examples: ['2026-01-01'] }),
    endsAt: Type.Unsafe<Date>({ type: 'string', format: 'date-time', description: 'Date de fin', examples: ['2026-01-02'] }),
    roomId: Type.Integer({ minimum: 1, description: 'Identifiant de la salle réservée', examples: [1] }),
});

export type BookingBodyType = Static<typeof BookingBody>;

export const Booking = Type.Object({
    id: Type.Integer({ description: 'Identifiant unique de la réservation', examples: [1] }),
    userId: Type.String({ description: "Identifiant de l'utilisateur", examples: ['toto'] }),
    startsAt: Type.Unsafe<Date>({ description: 'Date de début (AAAA-MM-JJ)', examples: ['2026-01-01'] }),
    endsAt: Type.Unsafe<Date>({ description: 'Date de fin (AAAA-MM-JJ)', examples: ['2026-01-02'] }),
    roomId: Type.Integer({ description: 'Identifiant de la salle réservée', examples: [1] }),
});

export type BookingType = Static<typeof Booking>;
export const BookingParams = Type.Object({
    id: Type.String({ minLength: 1, description: 'Identifiant de la réservation', examples: ['1'] }),
});
export type BookingParamsType = Static<typeof BookingParams>;
