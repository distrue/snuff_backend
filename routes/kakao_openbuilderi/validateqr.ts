import Express from 'express';
const Router = Express.Router();

import {one as Eventone} from '../../api/database/event';
import {read} from '../../api/database/qrcode';
import {attendanceUpdate} from '../../api/database/eventRule';

Router.post('/putQR', (req:Express.Request, res: Express.Response) => {

})

function fallBackResponse() {
    return {
        "version": "2.0",
        "template": {
          "outputs": [
            {
                "basicCard": {
                    "title": "유효한 qrcode가 아니에요..!",
                    "buttons": [],
                    "thumbnail": {
                        "imageUrl": "https://snuffstatic.s3.ap-northeast-2.amazonaws.com/%E1%84%89%E1%85%B3%E1%84%82%E1%85%AE%E1%84%91%E1%85%AE%E1%84%91%E1%85%A1+%E1%84%85%E1%85%A9%E1%84%80%E1%85%A9.PNG"
                    }
                }
            }]
        }
    };
}

Router.post('/getQR', (req:Express.Request, res:Express.Response) => {
    try {
        if(!req.body.action.params.qrcode) return res.status(400).send("no qrcode");
        const qrcode = req.body.action.params.qrcode.toString();
        const userId = req.body.userRequest.user.id;

        read(req.body.action.params.qrcode.toString())
        .then(async data => {
            if(!data) {
                const responseBody = fallBackResponse();
                return res.status(200).json(responseBody);
            }
            if(data.type === 'event') {
                let responseBody;
                await Eventone(data.code.toString())
                .then(data => {
                    if(data === null || data.length === 0) {
                        return responseBody = fallBackResponse();
                    }
                    responseBody = {
                        "version": "2.0",
                        "template": {
                        "outputs": [
                            {
                                "basicCard": {
                                    "title": "Event",
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
                                        "imageUrl": data[0].imageUrl
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
                await attendanceUpdate(userId, qrcode)
                .then((data:any) => {
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
                                            "messageText": `myScore ${data[0].blockId}`
                                        }
                                    ],
                                    "thumbnail": {
                                        "imageUrl": "https://snuffstatic.s3.ap-northeast-2.amazonaws.com/%E1%84%8F%E1%85%AE%E1%84%91%E1%85%A9%E1%86%AB+%E1%84%8B%E1%85%B5%E1%84%86%E1%85%B5%E1%84%8C%E1%85%B5.svg"
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
