import {viewTitle, searchTitle} from '../../service/search';
import { randomList } from '../../service/review';

export function reviewFallback(msg:string) {
    return({
        "version": "2.0",
        "template": {
          "outputs": [
            {
              "basicCard": {
                "description": msg,
                "thumbnail": {
                    "imageUrl": "https://snuffstatic.s3.ap-northeast-2.amazonaws.com/%E1%84%89%E1%85%B3%E1%84%82%E1%85%AE%E1%84%91%E1%85%AE%E1%84%91%E1%85%A1+%E1%84%85%E1%85%A9%E1%84%80%E1%85%A9.PNG",
                }
              }
            }
          ]
        }
    });
}

export function reviewResponse(data:any, imgURLs: string[]) {
    return({
        "version": "2.0",
        "template": {
          "outputs": [
            {
              "listCard":{
                "header": {
                  "title": viewTitle(data.name),
                  "imageUrl": imgURLs[0]
                },
                "items": [
                  {
                    "title": "음식점 위치 🗺️",
                    "description": "음식점 위치를 살펴보세요!",
                    "imageUrl": "https://snuffstatic.s3.ap-northeast-2.amazonaws.com/%E1%84%8C%E1%85%B5%E1%84%83%E1%85%A9.png",
                    "link": {
                      "web": `https://snufoodfighter.firebaseapp.com/?lat=${data.location.lat}&lng=${data.location.lng}&name=${searchTitle(data.name)}`
                    }
                  },
                  {                        
                    "title": "인스타에서 보기",
                    "description": "인스타 포스트 보기",
                    "imageUrl": "https://www.instagram.com/static/images/ico/favicon-192.png/68d99ba29cc8.png",
                    "link": {
                      "web": `https://www.instagram.com${data.postURL}`
                    }
                  }
                ],
                "buttons": [ 
                  {
                  "action": "message",
                  "label": "이벤트 보기",
                  "messageText": `askEvent ${ searchTitle(data.name) }`
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
                "title": viewTitle(data.name),
                "thumbnail": {
                  "imageUrl": imgURLs[0]
                },
                "buttons":[
                  {
                    "label": "음식점 사진",
                    "action": "message",
                    "messageText": `askImage ${ searchTitle(data.name) }`
                  },
                   {
                    "action": "message",
                    "label": "상세 리뷰 보기",
                    "messageText": `askDetail ${ searchTitle(data.name) }`
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
    });
}

export async function recommendList(data: any, skill_params: any):Promise<any[]> {
    function arrayShuffle(a: any[]) {
        for (let i = a.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [a[i], a[j]] = [a[j], a[i]];
        }
        return a;
    }      

    let datalist: any[] = [];
    let topcnt = 0;
          
    if(data.length > 0) {
        let topList = arrayShuffle(data); 
        for(let item of topList) {
            if(topcnt >= 5) break;
            topcnt+=1;
            let menudsc = String(item.content.match(/메뉴:.*$/));
            menudsc = menudsc!.replace(/\"/gi, "");
            datalist.push(recommendCell(item, menudsc, item.imgUrls[0], true))
        }
    }
    
    let findlen = 10 - topcnt; if(findlen < 0) findlen = 0;
    let filter2:object = {};
    if(skill_params.region.value!=="skip") filter2 = Object.assign(filter2, {region: {$regex: skill_params.region.value}});
    if(skill_params.food_type.value!=="skip") filter2 = Object.assign(filter2, {foodtype: {$regex: skill_params.food_type.value}});
    Object.assign(filter2, {'rating.total': {$lt: 4.5} });
    
    data = await randomList(filter2, findlen);
    
    for(let item of data) {
        if(datalist.length >= 10) break;
        let imgs = item.imgUrls;
        let menudsc = String(item.content.match(/메뉴:.*$/));
        menudsc = menudsc!.replace(/\"/gi, "");
        datalist.push(recommendCell(item, menudsc, item.imgUrls[0], false))
    }
    
    return datalist;
}

export function recommendCell(item: any, menudsc: string, imgs: string, pupapick: boolean) {
    return({
        "title": `${pupapick?"[푸파Pick]":""} ${viewTitle(item.name)}`,
        "description": menudsc,
        "thumbnail": {
          "imageUrl": imgs
        },
        "buttons": [
          {
            "action": "message",
            "label": "매장 정보 보기",
            "messageText": `askTotal ${searchTitle(item.name)}`
          },
          {
            "action": "message",
            "label": "매장 이벤트 보기",
            "messageText": `askEvent ${searchTitle(item.name)}`
          }
        ]
    })
}

export function pictureCell(data: any) {
    let datalist: any[] = [];
    let imgURLs = data.imgUrls;
    for(let idx in imgURLs) {
        if(datalist.length >= 10) break;
        datalist.push({
        "title":viewTitle(data.name),
        "thumbnail": {
            "imageUrl": imgURLs[idx],
            "link": {
                "web": imgURLs[idx]
            },
            "fixedRatio": true
        },
        "buttons":[]
        });
    } 
    return datalist
}

export function reviewtextResponse(data: any) {
    let parseContent = data.content.replace(/\nReview:\n/, "스누푸파's Review: \n");
    parseContent = parseContent.replace(/\nReview：\n/, "스누푸파's Review: \n");
    parseContent = parseContent.replace(/\"/gi, "");
    parseContent = parseContent.replace(/<a.*>#/gi, "#");
    parseContent = parseContent.replace(/<\/a>/gi, "");
    return({
        "version": "2.0",
        "template": {
            "outputs": [
            {
                "basicCard": {
                    "description": parseContent
                }
            }]
        }
    })
}