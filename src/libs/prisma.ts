import { Prisma, PrismaClient } from "@prisma/client";
import { logger } from "./logger";

export const prisma = new PrismaClient({
  log: [
    { emit: "event", level: "query" },
    { emit: "event", level: "info" },
    { emit: "event", level: "warn" },
    { emit: "event", level: "error" },
  ],
});

prisma.$on("query", (e: Prisma.QueryEvent) => {
  logger.info("Query " + e.query);
  logger.info("Duration " + e.duration + "ms");
});

prisma.$on("info", (e: Prisma.LogEvent) => {
  logger.info(e);
});

prisma.$on("error", (e: Prisma.LogEvent) => {
  logger.info(e);
});

prisma.$on("warn", (e: Prisma.LogEvent) => {
  logger.info(e);
});
