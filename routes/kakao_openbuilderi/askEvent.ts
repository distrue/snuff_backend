import Express from 'express';
const Router = Express.Router();

import {list} from '../../api/database/event';
import { resolve } from 'path';

Router.post('/askEvent', (req:Express.Request, res:Express.Response) => {
    let find = "";
    if(req.body.action.params.restaurant_name) {
      find = req.body.action.params.restaurant_name.replace(/_/gi, " ");
    }
    list(find)
    .then(async data => {
        console.log(data);
        let datalist: any[] = [];
        let responseBody:any;
        const pms = data.map(async item => {
          if(find && item.participants.length !== 1) return resolve("ok"); 
          return await datalist.push({
            "title":item.title,
            "thumbnail": {
              "imageUrl": item.imageUrl,
              "fixedRatio": true
            },
            "buttons":[
                {
                    "action": "block",
                    "label": "참여 방법",
                    "blockId": `${item.blockId}`
                },
                {
                  "action": "message",
                  "label": "참여매장보기",
                  "messageText": `eventFor ${item.code}`
              }
            ]
          });
        })
        await Promise.all(pms);
        if(datalist.length === 0) {
          responseBody = {
            "version": "2.0",
            "template": {
            "outputs": [
            {
            "basicCard": {
            "title": `현재 ${find?`${find}에서`:""} 진행중인 이벤트가 없어요!`,
            "description": "",
            "thumbnail": {
            "imageUrl": "https://testonit.s3.ap-northeast-2.amazonaws.com/%E1%84%89%E1%85%B3%E1%84%82%E1%85%AE%E1%84%91%E1%85%AE%E1%84%91%E1%85%A1+%E1%84%85%E1%85%A9%E1%84%80%E1%85%A9.PNG"
            },
            "buttons": []
            }
            }
            ]
            }
            }
        }
        else {
            responseBody = {
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
        }
        res.status(200).send(responseBody);
    });
});

export default Router;
