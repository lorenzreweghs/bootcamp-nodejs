/* eslint-disable @typescript-eslint/lines-between-class-members */

interface IProduct {
  name: string;
  description: string;
  price: number;
  discount?: number;
  category: string;
  stock: number;
  _id: string;
}

export default class Product {
  name: string;
  description: string;
  price: number;
  discount?: number;
  category: string;
  stock: number;
  _id: string;

  constructor({ name, description, price, discount, category, stock, _id }: IProduct) {
    this.name = name;
    this.description = description;
    this.price = price;
    this.discount = discount;
    this.category = category;
    this.stock = stock;
    // eslint-disable-next-line no-underscore-dangle
    this._id = _id;
  }
}
