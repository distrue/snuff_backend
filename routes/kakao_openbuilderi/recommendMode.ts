import Express from 'express';
const Router = Express.Router();

import { randomList, list} from '../../api/database/review';
import {viewTitle, searchTitle} from '../../api/database/search';

function shuffle(a: any[]) {
  for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

Router.post('/rcmd', (req:Express.Request, res:Express.Response) => {
    let filter:object = {};
    if(req.body.action !== undefined) {
      if(req.body.action.detailParams.region.value!=="skip") filter = Object.assign(filter, {region: {$regex: req.body.action.detailParams.region.value}});
      if(req.body.action.detailParams.food_type.value!=="skip") filter = Object.assign(filter, {foodtype: {$regex: req.body.action.detailParams.food_type.value}});
    }
    filter = Object.assign(filter, {'rating.total': {$gte: 4.5} });
    console.log(filter);
    list(filter)
    .then(async (data) => {
        let responseBody;
        let datalist: any[] = [];
        console.log("snupick", data.length);
        let topcnt = 0;
        if(data.length > 0) {
          let sel = shuffle(data); 
          for(let _item in sel) {
              if(topcnt >= 5) break;
              topcnt+=1;
              let item = data[_item];
              let imgs = item.imgUrls;
              let parseContent = String(item.content.match(/메뉴:.*$/));
              parseContent = parseContent!.replace(/\"/gi, "");
              datalist.push({
                  "title": `[스누Pick] ${viewTitle(item.name)}`,
                  "description": parseContent,
                  "thumbnail": {
                    "imageUrl": imgs[0]
                  },
                  "buttons": [
                    {
                      "action": "message",
                      "label": "리뷰 검색해 보기",
                      "messageText": `askTotal ${searchTitle(item.name)}`
                    },
                    {
                      "action":  "webLink",
                      "label": "인스타 포스트 보기",
                      "webLinkUrl": `https://www.instagram.com${item.postURL}`
                    }
                  ]
              });
          }
          responseBody = {
              "version": "2.0",
              "template": {
                "outputs": [
                  {
                    "carousel": {
                      "type": "basicCard",
                      "items": datalist
                    }
                  }
                ]
              }
          }
        }
        let findlen = 10 - topcnt; if(findlen < 0) findlen = 0;
        let filter2:object = {};
        if(req.body.action !== undefined) {
          if(req.body.action.detailParams.region.value!=="skip") filter2 = Object.assign(filter2, {region: {$regex: req.body.action.detailParams.region.value}});
          if(req.body.action.detailParams.food_type.value!=="skip") filter2 = Object.assign(filter2, {foodtype: {$regex: req.body.action.detailParams.food_type.value}});
        }
        data = await randomList(filter2, findlen);
        console.log("general", data.length);
        if(data.length > 0) {
          for(let _item in data) {
              if(datalist.length >= 10) { break; }
              let item = data[_item];
              let imgs = item.imgUrls;
              let parseContent = String(item.content.match(/메뉴:.*$/));
              parseContent = parseContent!.replace(/\"/gi, "");
              datalist.push({
                  "title": viewTitle(item.name),
                  "description": parseContent,
                  "thumbnail": {
                    "imageUrl": imgs[0]
                  },
                  "buttons": [
                    {
                      "action": "message",
                      "label": "리뷰 검색해 보기",
                      "messageText": `askTotal ${searchTitle(item.name)}`
                    },
                    {
                      "action":  "webLink",
                      "label": "인스타 포스트 보기",
                      "webLinkUrl": `https://www.instagram.com${item.postURL}`
                    }
                  ]
              });
          }
          responseBody = {
              "version": "2.0",
              "template": {
                "outputs": [
                  {
                    "carousel": {
                      "type": "basicCard",
                      "items": datalist
                    }
                  }
                ]
              }
          }
        }
        if(data.length === 0 && topcnt === 0) {
          responseBody = {
            "version": "2.0",
            "template": {
              "outputs": [
                {
                  "basicCard": {
                    "description": "아직 이 분류의 리뷰가 없어요ㅠㅠ 스누푸파가 더 노력할게요!",
                    "thumbnail": {
                        "imageUrl": "https://testonit.s3.ap-northeast-2.amazonaws.com/%E1%84%89%E1%85%B3%E1%84%82%E1%85%AE%E1%84%91%E1%85%AE%E1%84%91%E1%85%A1+%E1%84%85%E1%85%A9%E1%84%80%E1%85%A9.PNG",
                    }
                  }
                }
              ]
            }
          }  
        }
        res.status(200).send(responseBody);
    })
});

export default Router;
