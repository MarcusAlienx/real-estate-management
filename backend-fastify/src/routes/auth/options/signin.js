import { responseError, responseSuccess } from "../../../utils/schema/response.js";
import { authProperties } from "./schema.js";

export const signInOpts = (handler) => ({
  schema: {
    body: {
      type: 'object',
      required: ['email', 'password'],
      properties: {
        email: { type: 'string', format: 'email' },
        password: { type: 'string' }
      }
    },
    response: {
      200: responseSuccess({
        data: authProperties,
        message: "Success: User signed in"
      }),
      400: responseError(),
      404: responseError({ status: 404 })
    },
  },
  handler: handler,
});
