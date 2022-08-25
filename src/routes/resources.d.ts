import User from '../models/user';

export interface UserRequestBody {
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  password: string;
  address?: {
    street?: string;
    city?: string;
    number?: string;
    zip?: string;
    country?: string;
  };
}

export interface UserResponseBody extends UserRequestBody {
  id: string;
  password?: string;
}

export interface ProductRequestBody {
  name: string;
  description: string;
  price: number;
  discount: number;
  category: string;
  stock: number;
}

export interface ProductResponseBody extends ProductRequestBody {
  id: string;
}

export interface BasketRequestBody {
  items: [
    {
      product: {
        name: string;
        price: number;
        discount: number;
      };
      quantity: number;
    },
  ];
  discountCode: string;
  expireTime: Date;
}

export interface BasketResponseBody extends BasketRequestBody {
  id: string;
}

export interface TokenBody {
  id: string;
  user_id: string;
  refreshToken: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}
