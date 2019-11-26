import Express from 'express';
const Router = Express.Router();

import {one as Eventone} from '../../service/event';
import {read} from '../../service/qrcode';
import {attendanceUpdate} from '../../service/eventRule';
import {owncouponAdd} from '../../service/coupon';
import {OneTimeCodeModel, Coupon} from '../../models/coupon';

function fallBackResponse(text: string) {
    return {
        "version": "2.0",
        "template": {
          "outputs": [
            {
                "basicCard": {
                    "title": text,
                    "buttons": [],
                    "thumbnail": {
                        "imageUrl": "https://snuffstatic.s3.ap-northeast-2.amazonaws.com/qrque.png"
                    }
                }
            }]
        }
    };
}
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

Router.post('/getQR', (req:Express.Request, res:Express.Response) => {
    try {
        if(!req.body.action.params.qrcode) return res.status(400).send("no qrcode");
        console.log(JSON.parse(req.body.action.params.qrcode).barcodeData.toString());
        const qrcode = JSON.parse(req.body.action.params.qrcode).barcodeData.toString();
        const userId = req.body.userRequest.user.id;

        read(qrcode)
        .then(async data => {
            if(!data) {
                const responseBody = fallBackResponse("유효한 qrcode가 아니에요!");
                return res.status(200).json(responseBody);
            }
            if(data.type === 'event') {
                let responseBody;
                await Eventone(data.code.toString())
                .then(data => {
                    if(data === null || data.length === 0) {
                        return responseBody = fallBackResponse("유효한 qrcode가 아니에요!");
                    }
                    responseBody = {
                        "version": "2.0",
                        "template": {
                        "outputs": [
                            {
                                "basicCard": {
                                    "title": data[0].title,
                                    "buttons":[
                                        {
                                            "action": "block",
                                            "label": "참여 방법",
                                            "blockId": `${data[0].blockId}`
                                        },
                                        {
                                        "action": "message",
                                        "label": "참여매장보기",
                                        "messageText": `eventFor ${data[0].code}`
                                    }
                                    ],
                                    "thumbnail": {
                                        "imageUrl": data[0].imageUrl,
                                        "fixedRatio": true
                                    }
                                }
                            }]
                        }
                    }
                })
                return res.status(200).json(responseBody);
            }
            if(data.type === 'eventRule') {
                let responseBody;
                await attendanceUpdate(userId, data.code)
                .then((res:any) => {
                    if(res === null || res.length === 0) {
                        return responseBody = fallBackResponse("적립 오류 발생");
                    }
                    responseBody = {
                        "version": "2.0",
                        "template": {
                        "outputs": [
                            {
                                "basicCard": {
                                    "title": "적립 완료!",
                                    "description": "내 적립 현황을 확인해보세요!",
                                    "buttons": [
                                        {
                                            "action": "message",
                                            "label": "내적립현황",
                                            "messageText": `myScore ${data.code}`
                                        }
                                    ],
                                    "thumbnail": {
                                        "imageUrl": "https://snuffstatic.s3.ap-northeast-2.amazonaws.com/qrokay.png"
                                    }
                                }
                            }]
                        }
                    }
                })  
                return res.status(200).json(responseBody);
            }
        });
    } catch(err) {
        console.error(err);
        return res.status(500).send("Unintended error occured");
    }
});

// 사용자가 직접 지급받는 경우
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
            console.log(responseBody);
            return res.status(200).json(responseBody);
        }
        await OneTimeCodeModel.remove({code: code});
        let coupon:Coupon = item[0].coupon as Coupon;
        blockId = coupon.blockId;
    }    
    
    await owncouponAdd(blockId, userId);
    let responseBody = fallbackBlock("쿠폰이 지급되었어요, 내 쿠폰 확인하기에서 확인해 보세요!");
    console.log(responseBody);
    return res.status(200).json(responseBody);
});

export default Router;
