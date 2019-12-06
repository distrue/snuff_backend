let fs = require('fs-extra');
import bson from 'bson';
import mongoose from 'mongoose';
import {Review as ReviewItem, ReviewModel} from '../models/review';
import path from 'path';
import {getValue} from '../config';

export async function readCSV(data: string) {
  let file;
  if(data) file = data;
  else file = fs.readFileSync(path.join(__dirname, '..', 'result.csv'), 'utf-8');
  let lines = file.split('endline\n');
  lines.push(lines[0].split('end\n')[1]);
  lines[0] = lines[0].split('end\n')[0];
  return lines.map((v:any, idx: Number) =>
  {
    if(idx === 0) return null;
    const vv = v.split('$');
    if(vv[4] !== undefined) {
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

export async function addToDB(items: ReviewItem[]) {
  console.log('[+] Add to DB');
  for (const item of items) {
    if(item !== null) await add(item);
  }
  console.log('[!] Complete');
}

function work() {
  readCSV("").then(addToDB);
}

if (require.main === module) {
  mongoose.connect(getValue('dbUrl'), {useNewUrlParser: true}, () =>
  {
    console.log('[+] Connected to MongoDB server');
    work();
});
}
