import Express from 'express';
const Router = Express.Router();

import {list} from '../../service/review';
import {add} from '../../service/request';

import {fallbackBlock, basicCardCarousel} from '../../controllers/kakao_openbuilderi/common';
import {reviewFallback, reviewResponse, recommendList, pictureCell, reviewtextResponse, recommendCell } from '../../controllers/kakao_openbuilderi/review';
import { find as keywordFind } from '../../service/keyword';
import {RequestModel} from '../../models/request';
import { ReviewModel } from '../../models/review';


Router.post('/pickone', (req:Express.Request, res:Express.Response) => {
    const skill_params = req.body.action.detailParams;
    const find:any = {name: ""}
    if(skill_params && skill_params.restaurant_name) find.name = {$regex: skill_params.restaurant_name.value};
    if(req.body.action.clientExtra && req.body.action.clientExtra.restaurant_name) find.name = req.body.action.clientExtra.restaurant_name

    list(find)
    .then(async (data) => {
      let responseBody;
      if(data.length === 0) {
        await add(skill_params.restaurant_name.value);
        let restaurant_name = skill_params.restaurant_name.value.replace(/_/gi, " ");
        responseBody = reviewFallback(`아직 ${restaurant_name}의 리뷰가 없어요, 스누푸파가 준비해볼게요!`)
      }
      else responseBody = reviewResponse(data[0], data[0].imgUrls);
      res.status(200).send(responseBody);
    })
});

Router.post('/rcmd', async (req:Express.Request, res:Express.Response) => {
    let filter:object = {};
    let skill_params = req.body.action.detailParams;
    if(skill_params.region.value!=="skip") filter = Object.assign(filter, {region: {$regex: skill_params.region.value}});
    if(skill_params.food_type.value!=="skip") filter = Object.assign(filter, {foodtype: {$regex: skill_params.food_type.value}});
    filter = Object.assign(filter, {'rating.total': {$gte: 4.5} });
    
    return await list(filter)
    .then(async (data) => {
        let datalist: any[] = await recommendList(data, skill_params);

        if(datalist.length === 0) return res.status(200).send( fallbackBlock("아직 이 분류의 리뷰가 없어요ㅠㅠ 스누푸파가 더 노력할게요!") )
        return res.status(200).send(basicCardCarousel(datalist))
    })
});

Router.post('/pictureone', (req:Express.Request, res:Express.Response) => {
    let find = {name: {$regex: req.body.action.params.restaurant_name.replace(/_/gi, " ")}};
    
    list(find)
    .then(data => {
        let datalist: any[] = pictureCell(data[0]);
        res.status(200).send(basicCardCarousel(datalist));
    });
});

Router.post('/detailone', (req:Express.Request, res:Express.Response) => {
    const skill_params = req.body.action.detailParams;
    const find:any = {name: ""}
    if(skill_params && skill_params.restaurant_name) find.name = {$regex: skill_params.restaurant_name.value};
    if(req.body.action.clientExtra && req.body.action.clientExtra.restaurant_name) find.name = req.body.action.clientExtra.restaurant_name
    
    list(find)
    .then(data => {
        const responseBody = reviewtextResponse(data[0]);
        res.status(200).send(responseBody);
    });
});

Router.post('/keyword', async (req: Express.Request, res:Express.Response) => {
    let find = req.body.action.params.keyword.replace(/ /gi, "");
    let responseBody:any;
    let dataList: any = [];
    let predetermine = ["양식", "한식", "중식", "일식"]

    // 음식 종류의 분할인 경우 -> rcmd와 동일하게
    if(find in predetermine) {
        let skill_params = {food_type: {value: find}};
        return await list({foodtype: {$regex: skill_params.food_type.value}})
        .then(async (data) => {
            let datalist: any[] = await recommendList(data, skill_params);

            if(datalist.length === 0) return res.status(200).send( fallbackBlock("아직 이 분류의 리뷰가 없어요ㅠㅠ 스누푸파가 더 노력할게요!") )
            return res.status(200).send(basicCardCarousel(datalist))
        })
    }
    
    await keywordFind(find, false)
    .then(async (data: any) => {
        if(data.length === 0 || data[0].participants.length === 0) {
            responseBody = fallbackBlock(`${find} 키워드에 일치하는 식당이 아직 없어요, 이런 키워드는 어떤가요?`)
        }
        else {
            data[0].participants.forEach((item:any, idx:number) => {
                if(idx >= 5) return;            
                let menudsc = String(item.content.match(/메뉴:.*$/));
                menudsc = menudsc!.replace(/\"/gi, "");
                dataList.push(recommendCell(item, menudsc, item.imgUrls[0], false))
            })
            responseBody = basicCardCarousel(dataList)
            dataList = []
        }
        let more = await keywordFind("", true)
        more.forEach((item, idx) => 
        {
            if(idx >= 10) return;
            dataList.push({
            "action": "block",
            "label": item.phrase,
            "messageText": `키워드검색`,
            "blockId": "5ddfaa148192ac0001d64a89",
            "extra": {keyword: item.phrase}
            })
        })
        responseBody.template.quickReplies = dataList;
        res.status(200).json(responseBody);
    })
})

Router.post('/keywordExtra', async (req: Express.Request, res:Express.Response) => {
    let find = req.body.action.clientExtra.keyword.replace(/ /gi, "");
    let responseBody:any;
    let dataList: any = [];
    let predetermine = ["양식", "한식", "중식", "일식"]

    // 음식 종류의 분할인 경우 -> rcmd와 동일하게
    if(find in predetermine) {
        let skill_params = {food_type: {value: find}};
        return await list({foodtype: {$regex: skill_params.food_type.value}})
        .then(async (data) => {
            let datalist: any[] = await recommendList(data, skill_params);

            if(datalist.length === 0) return res.status(200).send( fallbackBlock("아직 이 분류의 리뷰가 없어요ㅠㅠ 스누푸파가 더 노력할게요!") )
            return res.status(200).send(basicCardCarousel(datalist))
        })
    }
    
    await keywordFind(find, false)
    .then(async (data: any) => {
        if(data.length === 0 || data[0].participants.length === 0) {
            const look = await RequestModel.findOne({name: find})
            if(!look) ReviewModel.create({name: find, count: 1})
            else { look.count += 1; await look.save() }
            responseBody = fallbackBlock(`${find} 키워드에 일치하는 식당이 아직 없어요, 이런 키워드는 어떤가요?`)
        }
        else {
            data[0].participants.forEach((item:any, idx:number) => {
                if(idx >= 5) return;            
                let menudsc = String(item.content.match(/메뉴:.*$/));
                menudsc = menudsc!.replace(/\"/gi, "");
                dataList.push(recommendCell(item, menudsc, item.imgUrls[0], false))
            })
            responseBody = basicCardCarousel(dataList)
            dataList = []
        }
        let more = await keywordFind("", true)
        more.forEach((item, idx) => 
        {
            if(idx >= 10) return;
            dataList.push({
                "action": "block",
                "label": item.phrase,
                "messageText": `키워드검색`,
                "blockId": "5ddfaa148192ac0001d64a89",
                "extra": {keyword: item.phrase}
            })
        })
        responseBody.template.quickReplies = dataList;
        res.status(200).json(responseBody);
    })
})


export default Router;
