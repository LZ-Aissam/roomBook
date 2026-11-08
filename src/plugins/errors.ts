import fp from 'fastify-plugin';
import { FastifyError } from 'fastify';

export default fp(async (app) => {
    app.setErrorHandler((error: FastifyError, request, reply) => {
        if (error.validation || (error.statusCode && error.statusCode >= 400 && error.statusCode < 500)) {
            return reply.send(error);
        }
        console.error("Internal Server Error:", error);
        reply.status(500).send({ statusCode: 500, error: 'Internal Server Error', message: 'Erreur interne du serveur.' });
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