import Express from 'express';
const Router = Express.Router();

import {one as Eventone} from '../../api/database/event';
import {read, add as qrAdd} from '../../api/database/qrcode';
import {attendanceUpdate} from '../../api/database/eventRule';


Router.post('/putQR', async (req:Express.Request, res: Express.Response) => {
    return await qrAdd("event", req.body.code, req.body.qrcode );
})

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

export default Router;
