export default {
  type: 'object',
  properties: {
    id: {
      type: 'string',
    },
    items: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          name: {
            type: 'string',
          },
          price: {
            type: 'number',
          },
          discount: {
            type: 'number',
          },
          quantity: {
            type: 'number',
          },
        },
      },
    },
    discountCode: {
      type: 'string',
    },
    expireTime: {
      type: 'string',
    },
  },
  required: ['items'],
};
