import Express from 'express';
const Router = Express.Router();

import {list} from '../../service/review';
import {add} from '../../service/request';

import {fallbackBlock, basicCardCarousel} from '../../controllers/kakao_openbuilderi/common';
import {reviewFallback, reviewResponse, recommendList, pictureCell, reviewtextResponse } from '../../controllers/kakao_openbuilderi/review';

Router.post('/pickone', (req:Express.Request, res:Express.Response) => {
    let skill_params = req.body.action.detailParams;
    let find = {name: {$regex: skill_params.restaurant_name.value.replace(/_/gi, " ")}};
    
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
    let find = {name: {$regex: req.body.action.params.restaurant_name.replace(/_/gi, " ")}};
    
    list(find)
    .then(data => {
        const responseBody = reviewtextResponse(data[0]);
        res.status(200).send(responseBody);
    });
});

export default Router;