import Express from 'express';
const Router = Express.Router();

import {list} from '../../api/database/review';
import {viewTitle, searchTitle} from '../../api/database/search';


Router.post('/pickone', (req:Express.Request, res:Express.Response) => {
    let find = {name: {$regex: req.body.action.detailParams.restaurant_name.value.replace(/_/gi, " ")}};
    console.log(find);
    list(find)
    .then(data => {
      let responseBody;
      if(data.length === 0) {
        responseBody = {
          "version": "2.0",
          "template": {
            "outputs": [
              {
                "basicCard": {
                  "description": `아직 ${(req.body.action.detailParams.restaurant_name.value.replace(/_/gi, " "))}의 리뷰가 없어요ㅠㅠ 리뷰 요청하기로 리뷰를 요청해주세요!`,
                  "thumbnail": {
                      "imageUrl": "https://testonit.s3.ap-northeast-2.amazonaws.com/%E1%84%89%E1%85%B3%E1%84%82%E1%85%AE%E1%84%91%E1%85%AE%E1%84%91%E1%85%A1+%E1%84%85%E1%85%A9%E1%84%80%E1%85%A9.PNG",
                  },
                  "buttons": [
                    {
                      "action": "message",
                      "label": "요청하기",
                      "messageText": `askNewone`
                    },
                    {
                      "action": "message",
                      "label":"괜찮아요",
                      "messageText": `끝내기`
                    }
                  ]
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
                        "title": `스누푸파 종합점수: ${totalscore}`,
                        "description": "랭킹 확인하기!",
                        "imageUrl": "https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/160/facebook/200/trophy_1f3c6.png",
                        "link": {
                          "web": `http://app.snufoodfighter.com/?name=${searchTitle(data[0].name)}` /// 점수 page
                        }
                      },
                      {
                        "title": "인스타에서 보기",
                        "description": "인스타에서 자세히 보기",
                        "imageUrl": "https://www.instagram.com/static/images/ico/favicon-192.png/68d99ba29cc8.png",
                        "link": {
                          "web": `https://www.instagram.com${data[0].postURL}`
                        }
                      },
                      {
                        "title": "스누푸파 app",
                        "description": "미리 들여다 보기! 현재 준비중이에요",
                        "imageUrl": "https://snuffstatic.s3.ap-northeast-2.amazonaws.com/%E1%84%89%E1%85%B3%E1%84%82%E1%85%AE%E1%84%91%E1%85%AE%E1%84%91%E1%85%A1+%E1%84%85%E1%85%A9%E1%84%80%E1%85%A9.PNG",
                        "link": {
                          "web": `https://snufffront.firebaseapp.com/` /// 준비 중 page
                        }
                      }
                    ],
                    "buttons": [
                      {
                        "action": "message",
                        "label": "상세 리뷰 보기",
                        "messageText": `askDetail ${ searchTitle(data[0].name) }`
                      },
                      {
                        "action": "message",
                        "label": "상세 사진 보기",
                        "messageText": `askImage ${ searchTitle(data[0].name) }`
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