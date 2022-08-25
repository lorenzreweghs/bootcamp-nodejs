/* eslint-disable @typescript-eslint/lines-between-class-members */
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
  _id: string;
}

export default class Basket {
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
  _id: string;

  constructor({ items, discountCode, expireTime, _id }: IBasket) {
    this.items = items;
    this.discountCode = discountCode;
    this.expireTime = expireTime;
    // eslint-disable-next-line no-underscore-dangle
    this._id = _id;
  }
}
