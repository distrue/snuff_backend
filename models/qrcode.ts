import mongoose from 'mongoose';
import { ObjectId } from 'bson';

export interface QRcode extends mongoose.Document {
  code: string;
  type: QRtype;
  expireDate: Date;
  connectObject: ObjectId;
}

type QRtype = 'attendance' | 'coupon';

const schema = new mongoose.Schema({
  expireDate: {
    default: Date.now,
    type: Date
  },
  code: {
    required: true,
    type: String
  },
  type: {
    required: true,
    type: String
  },
  connectObject: {
    required: true,
    type: ObjectId
  }
});

export const QRcodeModel = mongoose.model<QRcode>('QRcode', schema);
