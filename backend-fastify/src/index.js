import dotenv from "dotenv";
import Fastify from "fastify";
import FastifyBcrypt from "fastify-bcrypt";
import FastifyJwt from "@fastify/jwt";
import FastifyMultipart from "@fastify/multipart";
import mongoose from "mongoose";
import FastifyWebsocket from "@fastify/websocket";

// Local Files
import { setFastifySwagger } from "./swagger.js";
import { setFastifyCors } from "./cors.js";
import { setFastifyRoutes } from "./routes/index.js";
import { setFastifyStatic } from "./static.js";
import { setFastifyWebsocket } from "./websocket/index.js";

// Load environment variables based on NODE_ENV
const envFile = process.env.NODE_ENV === 'production' ? '.env.production' : '.env.development';
dotenv.config({ path: envFile });

// Fallback to .env if environment-specific file doesn't exist
if (!process.env.SECRET_KEY) {
  dotenv.config({ path: '.env' });
}

/**
 * The Fastify instance.
 * @type {import('fastify').FastifyInstance}
 */
export const fastify = await Fastify({ logger: process.env.LOGGER || true });

// We allow Multi Part Form
fastify.register(FastifyMultipart);
// We add Secret Key
const jwtSecret = process.env.SECRET_KEY;
if (!jwtSecret) {
  throw new Error('SECRET_KEY environment variable is required');
}
fastify.register(FastifyJwt, { secret: jwtSecret });
// We add Salt
fastify.register(FastifyBcrypt, {
  saltWorkFactor: Number(process.env.SALT) || 12,
});
// We register Websocket
fastify.register(FastifyWebsocket, {
  options: {
    clientTracking: true
  }
});

// We register authenticate
fastify.decorate("authenticate", async function (request, reply) {
  try {
    const user = await request.jwtVerify();
    request.user = user;
  } catch (err) {
    return reply.status(401).send({ message: "Unauthorized" });
  }
});
// Generate API documentation
setFastifySwagger(fastify);
// We serve static files -ex uploads/
setFastifyStatic(fastify);
// We allowed cors
setFastifyCors(fastify);
// We register routes
setFastifyRoutes(fastify);
// We set webSocket connection
setFastifyWebsocket();

mongoose
  .connect(process.env.DB_CONNECT)
  .then(() => {
    const PORT = process.env.PORT || 5000;
    try {
      fastify.listen(
        {
          port: PORT,
          host: '0.0.0.0',
        },
        () => {
          console.log("Listening on PORT: " + PORT);
        }
      );
    } catch (error) {
      fastify.log.error(error);
      console.log("ERROR", error);
    }
  })
  .catch((e) => {
    fastify.log.error(e);
    process.exit(1); // Exit process on connection error
  });
