import Express from 'express';
const Router = Express.Router();

import {viewTitle, searchTitle} from '../../api/database/search';
import {targets} from '../../api/database/event';
import mongoose from 'mongoose';

Router.post('/eventTgt', (req:Express.Request, res:Express.Response) => {
    let find = "";
    if(req.body.action.params.EventName) {
      find = req.body.action.params.EventName.replace(/_/gi, " ");
    }
    targets(mongoose.Types.ObjectId(find)) 
    .then(async data => {
        console.log(data);
        let datalist: any[] = [];
        await data[0].participants.forEach((item: any) => {
          let parseContent = String(item.content.match(/메뉴:.*$/));
          parseContent = parseContent!.replace(/\"/gi, "");
              
          datalist.push({
            "title": viewTitle(item.name),
            "description": parseContent,
            "thumbnail": {
              "imageUrl": item.imgUrls[0]
            },
            "buttons": [
              {
                "action": "message",
                "label": "매장 정보 보기",
                "messageText": `askTotal ${searchTitle(item.name)}`
              },
              {
                "action": "message",
                "label": "매장 이벤트 보기",
                "messageText": `askEvent ${searchTitle(item.name)}`
              }
            ]
          });
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
