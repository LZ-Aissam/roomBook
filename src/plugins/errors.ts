import fp from 'fastify-plugin';
import { FastifyError } from 'fastify';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/client';

export default fp(async (app) => {
    const prismaErrors = {
        P2002: {
            statusCode: 409,
            error: "Conflict",
            message: "Cette valeur existe déjà",
        },
        P2003: {
            statusCode: 409,
            error: "Conflict",
            message: "Cette ressource est référencée ailleurs",
        },
        P2025: {
            statusCode: 409,
            error: "Not Found",
            message: "Ressource introuvable",
        },
    }

    app.setErrorHandler((error: FastifyError, request, reply) => {
        if (error.validation || (error.statusCode && error.statusCode >= 400 && error.statusCode < 500)) {
            return reply.send(error);
        }
        if (error instanceof PrismaClientKnownRequestError && error.code in prismaErrors) {
            const {statusCode, ...rest} = prismaErrors[error.code as keyof typeof prismaErrors];
            return reply.code(statusCode).send({ statusCode, ...rest });
        }
        reply.status(500).send({ statusCode: 500, error: 'Internal Server Error', message: 'Erreur interne du serveur.' });
        return reply.send(error);
    });

    app.setNotFoundHandler((request, reply) => {
        reply.status(404).send({
            statusCode: 404,
            error: 'Not Found',
            message: `Route ${request.method} ${request.url} introuvable`,
        });
    });
});

export class HttpError extends Error {
    constructor(public statusCode: number, public message: string) {
        super(message);
    }
}