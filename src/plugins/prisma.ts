import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import "dotenv"
import fp from "fastify-plugin"
import { PrismaClient } from "../generated/prisma/client.ts";

export default fp(async (app) => {
    const adapter = new PrismaBetterSqlite3({ url: process.env.DATABASE_URL ?? "file:./dev.db" });
    const prisma = new PrismaClient({ adapter })

    app.decorate("prisma", prisma)
    app.addHook("onClose", ()=> prisma.$disconnect())
})

declare module "fastify" {
    interface FastifyInstance {
        prisma: PrismaClient;
    }
}