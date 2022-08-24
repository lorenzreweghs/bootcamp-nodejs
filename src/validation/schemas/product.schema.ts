export default {
  type: 'object',
  properties: {
    name: {
      type: 'string',
    },
    description: {
      type: 'string',
    },
    price: {
      type: 'number',
    },
    discount: {
      type: 'number',
    },
    category: {
      type: 'string',
    },
    stock: {
      type: 'number',
    },
  },
  required: ['name', 'description', 'price', 'category', 'stock'],
};
