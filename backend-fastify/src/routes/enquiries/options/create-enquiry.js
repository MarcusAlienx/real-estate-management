import { enquiryProperties } from "./schema.js";
import { responseSuccess, responseError } from '../../../utils/schema/response.js';

export const createEnquiryOpts = (fastify, handler) => ({
  preValidation: [fastify.authenticate],
  schema: {
    body: {
      type: 'object',
      required: ['title', 'content', 'topic', 'email', 'userTo'],
      properties: {
        title: { type: 'string', minLength: 1 },
        content: { type: 'string', minLength: 10, maxLength: 1000 },
        topic: { type: 'string' },
        email: { type: 'string', format: 'email' },
        userTo: { type: 'string' },
        property: {
          type: 'object',
          properties: {
            property_id: { type: 'string' },
            name: { type: 'string' }
          }
        }
      }
    },
    response: {
      201: responseSuccess({
        status: 201,
        message: 'Enquiry created!',
        data: enquiryProperties
      }),
      400: responseError(),
    },
  },
  handler,
});
