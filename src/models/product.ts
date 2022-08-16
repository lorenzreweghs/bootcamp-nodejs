import { ObjectId } from 'mongodb';

interface IProduct {
  name: string;
  description: string;
  price: number;
  discount: number;
  category: string;
  stock: number;
  id?: ObjectId;
}

export default class Product {
  constructor(public user: IProduct) {}
}
