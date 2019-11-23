import Express from 'express';
const Router = Express.Router();
import {ObjectId} from 'bson';

import {owncouponAdd, couponAdd} from '../../api/database/coupon';
import {OneTimeCodeModel, Coupon} from '../../models/coupon';

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

Router.post('/giveCoupon', async (req:Express.Request, res:Express.Response) => {
    let blockId;
    if(req.body.action.params.blockId) blockId = req.body.action.params.blockId.toString();
    const userId = req.body.userRequest.user.id;
    //const dateCut = req.body.action.params.expireDate.split('-');
    //const expireDate = new Date(dateCut[0], dateCut[1], dateCut[2]);
    if(req.body.action.params.code) {
        const code = req.body.action.params.code
        let item = await OneTimeCodeModel.find({code: code}).populate('coupon');
        if(item.length === 0) {
            let responseBody = fallbackBlock("유효한 코드가 아니에요!");
            return res.status(200).json(responseBody);
        }
        await OneTimeCodeModel.remove({code: code});
        let coupon:Coupon = item[0].coupon as Coupon;
        blockId = coupon.blockId;
    }    
    
    await owncouponAdd(blockId, userId) 
    .then(async data => {
        let responseBody = fallbackBlock("쿠폰이 지급되었어요, 내 쿠폰 확인하기에서 확인해 보세요!");
        return res.status(200).json(responseBody);
    });
});

Router.post('/addCode', async (req: Express.Request, res: Express.Response) => {
    let ans = await OneTimeCodeModel.create({
        code: req.body.code,
        coupon: new ObjectId(req.body.coupon)
    });
    return res.status(200).json({ans: ans});
});

Router.post('/couponAdd', async(req: Express.Request, res: Express.Response) => {
    let ans =  await couponAdd(req.body.blockId, req.body.imageUrl, req.body.title);
    return res.status(200).json({ans: ans});
});

export default Router;
