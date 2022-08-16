import { ObjectId } from 'mongodb';

interface IBasket {
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
  id?: ObjectId;
}

export default class Basket {
  constructor(public user: IBasket) {}
}
