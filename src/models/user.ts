import { ObjectId } from 'mongodb';

interface IUser {
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  password: string;
  address: {
    street: string;
    city: string;
    number: string;
    zip: string;
    country: string;
  };
  id?: ObjectId;
}

export default class User {
  constructor(public user: IUser) {}
}
