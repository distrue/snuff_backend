import mongoose from 'mongoose';
import { ObjectId } from 'bson';

export interface Attendance extends mongoose.Document {
  count: Number;
  connectReview: ObjectId;
  user: ObjectId;
  log: Date[];
}

const schema = new mongoose.Schema({
  count: {
      default: 0,
      type: Number
  },
  connectReview: {
    required: true,
    type: ObjectId,
    ref: "Review"
  },
  user: {
    type: ObjectId,
    ref: "user",
    required: true
  },
  log: {
    default: [],
    type: [{
        type: Date,
        default: Date.now
    }]
  }
});

export const AttendanceModel = mongoose.model<Attendance>('Attendance', schema);
