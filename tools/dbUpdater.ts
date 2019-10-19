let fs = require('fs-extra');
import bson from 'bson';
import mongoose from 'mongoose';
import {Review as ReviewItem, ReviewModel} from '../models/review';
import path from 'path';

mongoose.connect('mongodb://localhost/snuff', {useNewUrlParser: true}, () =>
  {
    console.log('[+] Connected to MongoDB server');
    work();
});

async function readCSV() {
  const file = fs.readFileSync(path.join(__dirname, '..', 'result.csv'), 'utf-8');
  const lines = file.split('endline\n');
  let cou = 0;
  return lines.map((v:any) =>
  {
    const vv = v.split('$');
    if(vv[4] !== undefined) { console.log(vv[3]); cou+=1;    
      console.log(cou);
      // vv[0]: postURL, vv[2]:region, vv[3]: foodtype 
      try {
        return {
          postURL: vv[0],
          name: vv[1],
          region: vv[2],
          foodtype: vv[3],
          content: vv[4],
          likeNum: vv[5],
          commentNum: vv[6],
          imgUrls: JSON.parse('{"target": ' + vv[7].replace(/'/gi, "\"") + '}').target 
        } as ReviewItem; 
      }
      catch {
        return null;
      }
    }
    else {
      return null;
    }
  });
}

async function add(item: ReviewItem) {
  // console.log('Review');
  try {
    await new ReviewModel({
      reviewId: new bson.ObjectId(),
      postURL: item.postURL,
      name: item.name,
      region: item.region,
      foodtype: item.foodtype,
      likeNum: item.likeNum,
      content: item.content,
      commentNum: item.commentNum,
      imgUrls: item.imgUrls
    }).save();
    return true;
  }
  catch(err) {
    console.warn(err);
    return false;
  } 
}

async function addToDB(items: ReviewItem[]) {
  console.log('[+] Add to DB');
  try {
    console.log('[-] UserModel Clear');``
    // await ReviewModel.collection.drop();
    // tslint:disable-next-line: no-empty
  } catch {}
  for (const item of items) {
    // console.log(`[+] Add ${item.userNickname}`);
    if(item !== null) {
      await add(item);
    }
  }
  console.log('[!] Complete');
}

function work() {
  readCSV().then(addToDB);
}
