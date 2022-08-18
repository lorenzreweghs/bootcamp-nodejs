import { UserRequestBody } from '../routes/resources';
import ajv from '../utils/ajv';
import userSchema from './schemas/user.schema';

export const validateUser = ajv.compile<UserRequestBody>(userSchema);
