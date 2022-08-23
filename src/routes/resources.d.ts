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

export interface TokenBody {
  id: string;
  user_id: string;
  refreshToken: string;
}
