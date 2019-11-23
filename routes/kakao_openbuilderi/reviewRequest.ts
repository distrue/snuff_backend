import Express from 'express';
const Router = Express.Router();

import {add} from '../../service/request';

Router.post('/reviewRequest', (req:Express.Request, res:Express.Response) => {
    add(req.body.action.detailParams.restaurant_name.value)
    .then((data:any) => {
        console.log(data);
        let responseBody;
        responseBody = {
        "version": "2.0",
            "template": {
                "outputs": [
                {
                    "basicCard": {
                    "description": "리뷰 요청이 완료되었어요! 스누푸파가 발전할 수 있게 도와주셔서 감사합니다 :)",
                    "thumbnail": {
                        "imageUrl": "https://testonit.s3.ap-northeast-2.amazonaws.com/%E1%84%89%E1%85%B3%E1%84%82%E1%85%AE%E1%84%91%E1%85%AE%E1%84%91%E1%85%A1+%E1%84%85%E1%85%A9%E1%84%80%E1%85%A9.PNG",
                    }
                    }
                }
                ]
            }
        }  
        return res.status(200).send(responseBody);
    })
});

export default Router;
