import mongoose from 'mongoose';
import {Review as ReviewItem, ReviewModel} from '../models/review';

async function work() {
  console.log("##");
  const data = await ReviewModel.find({});
  for(let item of data) {
      if(!item.rating.total) {
          item.rating.total = Number(item.rating.atmosphere) + Number(item.rating.taste) + Number(item.rating.quantity) + Number(item.rating.service);
          item.rating.total /= 4;
      }
      let al = await ReviewModel.findByIdAndUpdate(item._id, {$set: {"rating.total": item.rating.total}})
      console.log(item._id, al)
      // await console.log(await item.save());
  }
}

if (require.main === module) {
  mongoose.connect("mongodb://54.180.8.88/snuff", {useNewUrlParser: true}, async () =>
  {
    console.log('[+] Connected to MongoDB server');
    console.log("mongodb://54.180.8.88/snuff");
    work();
});
}
