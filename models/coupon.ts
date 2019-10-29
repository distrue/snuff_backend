import mongoose from 'mongoose';
import { ObjectId } from 'bson';

export interface Coupon extends mongoose.Document {
  blockId: string;
  userId: ObjectId;
  expireDate: Date;
}

const schema = new mongoose.Schema({
  expireDate: {
    default: Date.now,
    type: Date
  },
  blockId: {
    required: true,
    type: String
  },
  userId: {
    required: true,
    type: ObjectId,
    ref: "User"
  }
});

export const CouponModel = mongoose.model<Coupon>('Coupon', schema);
