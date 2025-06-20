
import { initTRPC } from '@trpc/server';
import { createHTTPServer } from '@trpc/server/adapters/standalone';
import 'dotenv/config';
import cors from 'cors';
import superjson from 'superjson';
import { generateSuperheroNameInputSchema, getSuperheroNamesInputSchema } from './schema';
import { generateSuperheroName } from './handlers/generate_superhero_name';
import { getSuperheroNames } from './handlers/get_superhero_names';

const t = initTRPC.create({
  transformer: superjson,
});

const publicProcedure = t.procedure;
const router = t.router;

const appRouter = router({
  healthcheck: publicProcedure.query(() => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }),
  generateSuperheroName: publicProcedure
    .input(generateSuperheroNameInputSchema)
    .mutation(({ input }) => generateSuperheroName(input)),
  getSuperheroNames: publicProcedure
    .input(getSuperheroNamesInputSchema)
    .query(({ input }) => getSuperheroNames(input)),
});

export type AppRouter = typeof appRouter;

async function start() {
  const port = process.env['SERVER_PORT'] || 2022;
  const server = createHTTPServer({
    middleware: (req, res, next) => {
      cors()(req, res, next);
    },
    router: appRouter,
    createContext() {
      return {};
    },
  });
  server.listen(port);
  console.log(`TRPC server listening at port: ${port}`);
}

start();
