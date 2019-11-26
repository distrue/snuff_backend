import Express from 'express';
const Router = Express.Router();

import {viewTitle, searchTitle} from '../../service/search';
import {targets, list} from '../../service/event';
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
        let pms = data.map(async (item:any) => {
          if(find && item.participants.length !== 1) return resolve("ok");
          if(!find && item.type === 'in_rule') return resolve("ok");
          if(item.type === 'in_rule') {
            return await datalist.push({
              "title":item.title,
              "thumbnail": {
                "imageUrl": item.imageUrl || "https://snuffstatic.s3.ap-northeast-2.amazonaws.com/%E1%84%8F%E1%85%AE%E1%84%91%E1%85%A9%E1%86%AB+%E1%84%8B%E1%85%B5%E1%84%86%E1%85%B5%E1%84%8C%E1%85%B5.svg",
                "fixedRatio": true
              },
              "buttons":[
                  {
                      "action": "message",
                      "label": "내적립 현황",
                      "messageText": `myScore ${item.code}`
                  },
                  {
                    "action": "message",
                    "label": "리워드 보기",
                    "messageText": `eventRule ${item.code}`
                  }
              ]
            });
          } 
          else {
            let check = item.participants[0]._id.toString();
            console.log(check, item.reward, item.reward[check]);
            if(find && item.reward && item.reward[check]) {
              return await datalist.push({
                "title":item.title,
                "thumbnail": {
                  "imageUrl": item.imageUrl,
                  "fixedRatio": true
                },
                "buttons":[
                  {
                    "action": "block",
                    "label": "매장이벤트",
                    "messageText": `${item.reward[check]}`,
                    "blockId": `${item.blockId}`
                  },
                  {
                    "action": "message",
                    "label": "참여매장보기",
                    "messageText": `eventFor ${item.code}`
                  }
                ]
              });
            }
            else {
              return await datalist.push({
                "title":item.title,
                "thumbnail": {
                  "imageUrl": item.imageUrl,
                  "fixedRatio": true
                },
                "buttons":[
                    {
                        "action": "block",
                        "label": "이벤트 상세",
                        "blockId": `${item.blockId}`
                    },
                    {
                      "action": "message",
                      "label": "참여매장보기",
                      "messageText": `eventFor ${item.code}`
                  }
                ]
              });
            }
          }
        })
        await Promise.all(pms);
        if(datalist.length === 0) {
          responseBody = {
            "version": "2.0",
            "template": {
            "outputs": [{
              "basicCard": {
              "title": `현재 ${find?`${find}에서`:""} 진행중인 이벤트가 없어요!`,
              "description": "",
              "thumbnail": {
                "imageUrl": "https://testonit.s3.ap-northeast-2.amazonaws.com/%E1%84%89%E1%85%B3%E1%84%82%E1%85%AE%E1%84%91%E1%85%AE%E1%84%91%E1%85%A1+%E1%84%85%E1%85%A9%E1%84%80%E1%85%A9.PNG"
              },
              "buttons": []
              }
            }]
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
        console.log("!")
        res.status(200).send(responseBody);
    });
});

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

// for webApp
Router.get('/eventTgt', (req:Express.Request, res:Express.Response) => {
  let find = "";
  if(req.query.eventName) {
    find = req.query.eventName.replace(/_/gi, " ");
  }
  targets(find) 
  .then(async data => {
      console.log(data);
      let datalist: any[] = [];
      if(data.length === 0) return res.status(400).send("no review");
      return res.status(200).json({participants: data[0].participants, reward: data[0].reward})
  });
});

export default Router;
