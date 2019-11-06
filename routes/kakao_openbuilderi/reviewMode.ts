import Express from 'express';
const Router = Express.Router();

import {list} from '../../api/database/review';
import {viewTitle, searchTitle} from '../../api/database/search';
import {add} from '../../api/database/request';


const ALL = 246;

function getRating(score: string) {
  switch(score) {
    case "4.875":
        return 1;
    case "4.75":
        return 3;
    case "4.625":
        return 9;
    case "4.5":
        return 22;
    case "4.375":
        return 48;
    case "4.25":
        return 85;
    case "4.125":
        return 125;
    case "4":
        return 167;
    case "3.875":
        return 201;
    case "3.75":
        return 224;
    case "3.625":
        return 238;
    case "3.5":
        return 243;
    case "3.375":
        return 246;
  }
}


Router.post('/pickone', (req:Express.Request, res:Express.Response) => {
    let find = {name: {$regex: req.body.action.detailParams.restaurant_name.value.replace(/_/gi, " ")}};
    console.log(find);
    list(find)
    .then(async (data) => {
      let responseBody;
      if(data.length === 0) {
        await add(req.body.action.detailParams.restaurant_name.value);
        responseBody = {
          "version": "2.0",
          "template": {
            "outputs": [
              {
                "basicCard": {
                  "description": `아직 ${(req.body.action.detailParams.restaurant_name.value.replace(/_/gi, " "))}의 리뷰가 없어요, 스누푸파가 준비해볼게요!`,
                  "thumbnail": {
                      "imageUrl": "https://snuffstatic.s3.ap-northeast-2.amazonaws.com/%E1%84%89%E1%85%B3%E1%84%82%E1%85%AE%E1%84%91%E1%85%AE%E1%84%91%E1%85%A1+%E1%84%85%E1%85%A9%E1%84%80%E1%85%A9.PNG",
                  }
                }
              }
            ]
          }
        }  
      }
      else {
        let imgURLs = data[0].imgUrls;
        let totalscore = Number(data[0].rating.taste) + Number(data[0].rating.quantity) + Number(data[0].rating.atmosphere) + Number(data[0].rating.service);
        totalscore /= 4;
      
        responseBody = {
            "version": "2.0",
            "template": {
              "outputs": [
                {
                  "listCard":{
                    "header": {
                      "title": viewTitle(data[0].name),
                      "imageUrl": imgURLs[0]
                    },
                    "items": [
                      {
                        "title": `종합점수: ${totalscore}, 상세점수보기`,
                        "description": `${ALL}개 매장 중 ${getRating(String(totalscore))}등`,
                        "imageUrl": "https://snuffstatic.s3.ap-northeast-2.amazonaws.com/%E1%84%85%E1%85%A2%E1%86%BC%E1%84%8F%E1%85%B5%E1%86%BC.png",
                        "link": {
                          "web": `https://snufoodfighter.firebaseapp.com/ranking/?name=${searchTitle(data[0].name)}` /// 점수 page
                        }
                      },
                      {
                        "title": "음식점 위치 🗺️",
                        "description": "음식점 위치를 살펴보세요!",
                        "imageUrl": "https://snuffstatic.s3.ap-northeast-2.amazonaws.com/%E1%84%8C%E1%85%B5%E1%84%83%E1%85%A9.png",
                        "link": {
                          "web": `https://snufoodfighter.firebaseapp.com/?lat=${data[0].location.lat}&lng=${data[0].location.lng}&name=${searchTitle(data[0].name)}`
                        }
                      },
                      {                        
                        "title": "인스타에서 보기",
                        "description": "인스타 포스트 보기",
                        "imageUrl": "https://www.instagram.com/static/images/ico/favicon-192.png/68d99ba29cc8.png",
                        "link": {
                          "web": `https://www.instagram.com${data[0].postURL}`
                        }
                      }
                    ],
                    "buttons": [ 
                      {
                      "action": "message",
                      "label": "이벤트 보기",
                      "messageText": `askEvent ${ searchTitle(data[0].name) }`
                      },
                      {
                        "action": "share",
                        "label": "공유하기"
                      }
                    ]
                  } 
                },
                {
                  "basicCard":{
                    "title": viewTitle(data[0].name),
                    "thumbnail": {
                      "imageUrl": imgURLs[0]
                    },
                    "buttons":[
                      {
                        "label": "음식점 사진",
                        "action": "message",
                        "messageText": `askImage ${ searchTitle(data[0].name) }`
                      },
                       {
                        "action": "message",
                        "label": "상세 리뷰 보기",
                        "messageText": `askDetail ${ searchTitle(data[0].name) }`
                       },
                       {
                         "action": "share",
                         "label": "공유하기"
                       }
                    ]
                  } 
                }
              ]
            }
          }
        }
        res.status(200).send(responseBody);
    })
});

export default Router;