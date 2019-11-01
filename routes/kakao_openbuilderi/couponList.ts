import Express from 'express';
const Router = Express.Router();

import {owncouponList} from '../../api/database/coupon';

function fallbackBlock(msg:string) {
  return {
    "version": "2.0",
    "template": {
      "outputs": [
        {
            "basicCard": {
                "title": msg,
                "buttons": [],
                "thumbnail": {
                    "imageUrl": "https://snuffstatic.s3.ap-northeast-2.amazonaws.com/%E1%84%89%E1%85%B3%E1%84%82%E1%85%AE%E1%84%91%E1%85%AE%E1%84%91%E1%85%A1+%E1%84%85%E1%85%A9%E1%84%80%E1%85%A9.PNG"
                }
            }
        }]
    }
  };
}

Router.post('/couponList', (req:Express.Request, res:Express.Response) => {
    let find = "";
    if(req.body.action.params.EventName) {
      find = req.body.userRequest.user.id;
    }
    owncouponList(find) 
    .then(async data => {
        let responseBody;
        let datalist: any[] = [];
        if(data.length === 0) {
          let responseBody = fallbackBlock("아직 보유한 쿠폰이 없어요!");
          return res.status(200).json(responseBody);
        }
        await data.forEach((item: any) => {
          datalist.push({
            "title": item.display.title,
            "description": "",
            "thumbnail": {
              "imageUrl": item.display.imageUrl || 'https://snuffstatic.s3.ap-northeast-2.amazonaws.com/%E1%84%8F%E1%85%AE%E1%84%91%E1%85%A9%E1%86%AB+%E1%84%8B%E1%85%B5%E1%84%86%E1%85%B5%E1%84%8C%E1%85%B5.svg'
            },
            "buttons": [
              {
                "action": "block",
                "label": "자세히 보기",
                "blockId": `${item.blockId}`
              }
            ]
          });
        });
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
        res.status(200).send(responseBody);
    });
});

export default Router;
