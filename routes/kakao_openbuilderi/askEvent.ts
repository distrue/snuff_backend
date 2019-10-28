import Express from 'express';
const Router = Express.Router();

import {viewTitle} from '../../api/database/search';
import {list} from '../../api/database/review';

Router.post('/askEvent', (req:Express.Request, res:Express.Response) => {
    let find = {name: {$regex: req.body.action.params.restaurant_name.replace(/_/gi, " ")}};
    console.log(find);
    list(find)
    .then(data => {
        let datalist: any[] = [];
        let imgURLs = data[0].imgUrls;
        /*for(let idx in imgURLs) {
          if(datalist.length >= 10) break;
          datalist.push({
            "title":viewTitle(data[0].name),
            "thumbnail": {
              "imageUrl": imgURLs[idx],
              "link": {
                  "web": imgURLs[idx]
              }
            },
            "buttons":[]
          });
        } */
        datalist.push({
            "title":"이벤트 1",
            "thumbnail": {
              "imageUrl": "https://snuffstatic.s3.ap-northeast-2.amazonaws.com/kakaomap.png",
              "fixedRatio": true
            },
            "buttons":[
                {
                    "action": "block",
                    "label": "쿠폰 연결",
                    "blockId": `5d9b3c5192690d0001a44921`
                }
            ]
          });
        const responseBody = {
            "version": "2.0",
            "template": {
              "outputs": [
                {
                    "carousel": {
                        "type": "basicCard",
                        "items": datalist
                    }
                }]
            }
        }
        res.status(200).send(responseBody);
    });
});

export default Router;
