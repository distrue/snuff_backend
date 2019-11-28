import Express from 'express';
const Router = Express.Router();

import {targets, list} from '../../service/event';
import { resolve } from 'path';
import { fallbackBlock, basicCardCarousel } from '../../controllers/kakao_openbuilderi/common';
import { inruleCell, noruleCell, targetCell, targetMapCell } from '../../controllers/kakao_openbuilderi/event';

Router.post('/askEvent', async (req:Express.Request, res:Express.Response) => {
  let responseBody:any, datalist: any[] = [];
  let params = req.body.action.params;
  if(params.restaurant_name) {
    const find = req.body.action.params.restaurant_name.replace(/_/gi, " ");
    await list(find)
    .then(async data => {
        let pms = data.map((item:any) => {
          if(item.participants.length !== 1) return resolve("ok");  // 자신이 포함되어 있지 않으면 제거
          if(item.type === 'in_rule') return datalist.push(inruleCell(item));  // 특정 가게의 적립 event
          let check = item.participants[0]._id.toString();  // 비적립 이벤트 확인
          if(item.reward && item.reward[check]) return datalist.push(noruleCell(item, item.reward[check]));  // 자신의 reward가 있는 경우
          return datalist.push(noruleCell(item));  // 자신의 reward가 없는 경우
        })
        await Promise.all(pms);
        if(datalist.length === 0) responseBody = fallbackBlock(`현재 ${find}에서 진행중인 이벤트가 없어요!`)
        else responseBody = basicCardCarousel(datalist)
    });
  }
  else {
    await list("")
    .then(async data => {
        let pms = data.map((item:any) => {
          if(item.type === 'in_rule') return resolve("ok");  // 적립 이벤트는 표시하지 않음
          return datalist.push(noruleCell(item));
        })
        await Promise.all(pms);
        if(datalist.length === 0) responseBody = fallbackBlock("현재 진행중인 이벤트가 없어요!")
        else responseBody = basicCardCarousel(datalist)
    });
  }
  return res.status(200).send(responseBody);
});

Router.post('/eventTgt', (req:Express.Request, res:Express.Response) => {
    let find = "", responseBody, datalist: any[] = [];
    if(req.body.action.params.EventName) find = req.body.action.params.EventName.replace(/_/gi, " ");
    
    targets(find) 
    .then(async data => {
        if(data.length === 0) return responseBody = fallbackBlock("참여하고 있는 매장이 없어요")
        datalist.push(targetMapCell(find))
        data[0].participants.forEach((item: any, idx: number) => {
          if(idx >= 9) return 
          let parseContent = String(item.content.match(/메뉴:.*$/));
          parseContent = parseContent!.replace(/\"/gi, "");
          datalist.push(targetCell(item, parseContent));
        });
        responseBody = basicCardCarousel(datalist)
    });
    return res.status(200).send(responseBody);
});

// for webApp
Router.get('/eventTgt', (req:Express.Request, res:Express.Response) => {
  let find = "";
  if(req.query.eventName) find = req.query.eventName.replace(/_/gi, " ");

  targets(find) 
  .then(async data => {
      if(data.length === 0) return res.status(400).send("no review");
      return res.status(200).json({participants: data[0].participants, reward: data[0].reward})
  });
});

export default Router;
