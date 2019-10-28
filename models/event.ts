import mongoose from 'mongoose';
import { ObjectId } from 'bson';
import { Review } from './review';

export interface Event extends mongoose.Document {
  title: string; 
  code: string;
  description: string;
  participants: ObjectId[] | Review[];
  blockId: string;
  imageUrl: string;
}

const schema = new mongoose.Schema({
  title: {
    required: true,
    type: String
  },
  code: {
    required: true,
    type: String
  },
  blockId: {
    required: true,
    type: String
  },
  description: {
    default: "",
    type: String
  },
  imageUrl: {
    default: "",
    type: String
  },
  participants: {
    default: [],
    type: [{
      ref: 'Review',
      type: ObjectId
    }]
  }
});

export const EventModel = mongoose.model<Event>('Event', schema);
