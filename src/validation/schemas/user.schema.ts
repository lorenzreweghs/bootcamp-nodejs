export default {
  type: 'object',
  properties: {
    firstName: {
      type: 'string',
    },
    lastName: {
      type: 'string',
    },
    email: {
      type: 'string',
      format: 'email',
    },
    role: {
      type: 'string',
    },
    password: {
      type: 'string',
    },
    address: {
      type: 'object',
    },
    street: {
      type: 'string',
    },
    city: {
      type: 'string',
    },
    number: {
      type: 'string',
    },
    zip: {
      type: 'string',
    },
    country: {
      type: 'string',
    },
  },
  required: ['firstName', 'lastName', 'email', 'password', 'role'],
};
