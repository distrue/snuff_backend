import Express from 'express';
const Router = Express.Router();
import {owncouponList} from '../../service/coupon';

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
                        "imageUrl": "https://snuffstatic.s3.ap-northeast-2.amazonaws.com/coupon.png"
                    }
                }
            }]
        }
      };
}

Router.post('/couponList', (req:Express.Request, res:Express.Response) => {
    let find = "";
    if(req.body.userRequest.user.id) {
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
              "imageUrl": item.display.imageUrl || 'https://snuffstatic.s3.ap-northeast-2.amazonaws.com/coupon.png'
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

// 챗봇에서 지급해주는 경우
// Context 활용할 것
// -> 기존의 보기좋지 않은 keyword, restaurant_name을 이용하는 것들도 context 대체되면 좋을 것!
Router.post('/grantCoupon', async (req:Express.Request, res:Express.Response) => {
    return res.status(200).send("TBD")
})

export default Router;
