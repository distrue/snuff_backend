import mongoose from 'mongoose';
import {list} from '../api/database/review';

mongoose.connect('mongodb://localhost/snuff', {useNewUrlParser: true}, () =>
  {
    console.log('[+] Connected to MongoDB server');
    run();
});

async function run() {
    let ans = await list();
    for(let _item in ans) {
        let item = ans[_item];
        let totalscore;
        try {
            totalscore = Number(item.rating.taste) + Number(item.rating.quantity) + Number(item.rating.atmosphere) + Number(item.rating.service);
            totalscore /= 4;
        } catch(err) {
            totalscore = 0;
        }
        item.rating = {...item.rating, total: totalscore};
        console.log(item.name, item.rating);
        await item.save();
    }
}


