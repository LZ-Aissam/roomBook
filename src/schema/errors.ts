import { Type } from "@fastify/type-provider-typebox";

export const ErrorSchema = Type.Object({
    statusCode: Type.Integer({ description: 'Code HTTP', examples: [404] }),
    error: Type.String({ description: 'Nom du statut HTTP', examples: ['Not Found'] }),
    message: Type.String({ description: "Détail de l'erreur", examples: ['Room not found'] }),
});