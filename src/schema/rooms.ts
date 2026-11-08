import { Type, Static } from "@fastify/type-provider-typebox";

export const RoomBody = Type.Object({
    name: Type.String({ minLength: 1, description: 'Nom de la salle', examples: ['A101'] }),
    capacity: Type.Integer({ minimum: 1, description: 'Nombre de places', examples: [30] }),
});

export type RoomBodyType = Static<typeof RoomBody>;

export const Room = Type.Object({
    id: Type.Integer({ description: 'Identifiant unique de la salle', examples: [1] }),
    name: Type.String({ description: 'Nom de la salle', examples: ['A101'] }),
    capacity: Type.Integer({ description: 'Nombre de places', examples: [30] }),
});

export type RoomType = Static<typeof Room>;
