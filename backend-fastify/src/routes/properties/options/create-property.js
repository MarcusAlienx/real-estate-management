import { propertyProperties } from "./schema.js";
import { responseSuccess, responseError } from "../../../utils/schema/response.js";

export const createPropertyOpts = (fastify, handler) => ({
  preValidation: [fastify.authenticate],
  schema: {
    body: {
      type: 'object',
      required: ['name', 'address', 'type', 'position'],
      properties: {
        name: { type: 'string', minLength: 4 },
        address: { type: 'string', minLength: 1 },
        type: { type: 'string' },
        position: {
          type: 'object',
          properties: {
            lat: { type: 'number' },
            lng: { type: 'number' }
          },
          required: ['lat', 'lng']
        },
        description: { type: 'string', minLength: 10 },
        transactionType: { type: 'string', enum: ['sale', 'rent'] },
        price: { type: 'number' },
        paymentFrequency: { type: 'string', enum: ['yearly', 'quarterly', 'monthly', 'bi-weekly', 'weekly', 'daily'] },
        features: { type: 'array', items: { type: 'string' } },
        currency: { type: 'string' },
        contactNumber: { type: 'string' },
        contactEmail: { type: 'string' }
      }
    },
    response: {
      201: responseSuccess({
        status: 201,
        message: "Property created!",
        data: propertyProperties
      }),
      400: responseError({
        status: 400,
        message: "Error: Something went wrong, please try again later."
      }),
      401: responseError({
        status: 401,
        message: "No Authorization was found in request.headers",
      }),
    },
  },
  handler: handler,
});
