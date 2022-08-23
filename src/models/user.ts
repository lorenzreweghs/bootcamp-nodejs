/* eslint-disable @typescript-eslint/lines-between-class-members */

interface IUser {
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
  _id: string;
}

export default class User {
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
  _id: string;

  constructor({ firstName, lastName, email, role, password, address, _id }: IUser) {
    this.firstName = firstName;
    this.lastName = lastName;
    this.email = email;
    this.role = role;
    this.password = password;
    this.address = address;
    // eslint-disable-next-line no-underscore-dangle
    this._id = _id;
  }
}
