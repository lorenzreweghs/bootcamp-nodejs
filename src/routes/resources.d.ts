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
}
