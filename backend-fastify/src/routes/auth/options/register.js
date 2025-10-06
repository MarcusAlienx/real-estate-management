import { authProperties } from "./schema.js";

export const registerOpts = (handler) => ({
  schema: {
    body: {
      type: 'object',
      required: ['fullName', 'email', 'password'],
      properties: {
        fullName: { type: 'string', minLength: 4 },
        email: { type: 'string', format: 'email' },
        password: { type: 'string', minLength: 8 }
      }
    },
    response: {
      201: authProperties,
      400: { type: 'object', properties: { message: { type: 'string' } } }
    },
  },
  handler: handler,
});
