import Express from 'express';
const Router = Express.Router();

import {list} from '../../api/database/review';


Router.post('/askLocation', (req:Express.Request, res:Express.Response) => {
    let find = {name: {$regex: req.body.action.params.restaurant_name.replace(/_/gi, " ")}};
    console.log(find);
    list(find)
    .then(data => {
        let datalist: any[] = [];
        if(data[0].location) {
          datalist.push({
            "title":"매장 위치 보기",
            "thumbnail": {
              "imageUrl": "https://snuffstatic.s3.ap-northeast-2.amazonaws.com/kakaomap.png",
              "link": {
                "web": `https://snufoodfighter.firebaseapp.com/?lat=${data[0].location.lat}&lng=${data[0].location.lng}&name=${"꾸아땅"}`
            }
            },
            "descriptions": "kakao map으로 매장 위치를 살펴보세요!",
            "buttons":[]
          });
        }
        else {
          datalist.push({
            "title":"매장 정보 등록 대기중",
            "thumbnail": {
              "imageUrl": "https://snuffstatic.s3.ap-northeast-2.amazonaws.com/kakaomap.png"
            },
            "descriptions": "매장 정보 등록을 대기 하고 있어요",
            "buttons":[]
          });
        }
        const responseBody = {
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
