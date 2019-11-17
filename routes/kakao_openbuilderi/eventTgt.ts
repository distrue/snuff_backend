import Express from 'express';
const Router = Express.Router();

import {viewTitle, searchTitle} from '../../api/database/search';
import {targets} from '../../api/database/event';

Router.post('/eventTgt', (req:Express.Request, res:Express.Response) => {
    let find = "";
    if(req.body.action.params.EventName) {
      find = req.body.action.params.EventName.replace(/_/gi, " ");
    }
    targets(find) 
    .then(async data => {
        console.log(data);
        let datalist: any[] = [];
        if(data.length === 0) return res.status(400).send("no review");
        datalist.push({
          "title": "참여매장 한눈에 보기",
          "description": "이벤트에 참여하고 있는 매장들을 한눈에 살펴보세요!",
          "thumbnail": {
            "imageUrl": "https://snuffstatic.s3.ap-northeast-2.amazonaws.com/kakaomap.png"
          },
          "buttons": [
            {
              "action": "webLink",
              "label": "지도로 보기",
              "webLinkUrl": `https://snufoodfighter.firebaseapp.com/?eventName=${find}`
            }
          ]
        });
        await data[0].participants.forEach((item: any, idx: number) => {
          if(idx >= 9) return 
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
