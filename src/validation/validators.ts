import { BasketRequestBody, ProductRequestBody, UserRequestBody } from '../routes/resources';
import ajv from '../utils/ajv';
import basketSchema from './schemas/basket.schema';
import productSchema from './schemas/product.schema';
import userSchema from './schemas/user.schema';

export const validateUser = ajv.compile<UserRequestBody>(userSchema);
export const validateProduct = ajv.compile<ProductRequestBody>(productSchema);
export const validateBasket = ajv.compile<BasketRequestBody>(basketSchema);
