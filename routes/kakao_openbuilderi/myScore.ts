import Express from 'express';
const Router = Express.Router();

import {getAttendance, getEventRule} from '../../api/database/eventRule';

function fallBackResponse(txt:string, code?:string) {
  return {
      "version": "2.0",
      "template": {
        "outputs": [
          {
              "basicCard": {
                  "title": txt,
                  "buttons": [{
                    "action": "message",
                    "label": "리워드 보기",
                    "messageText": `eventRule ${code}`
                  }],
                  "thumbnail": {
                      "imageUrl": "https://snuffstatic.s3.ap-northeast-2.amazonaws.com/%E1%84%89%E1%85%B3%E1%84%82%E1%85%AE%E1%84%91%E1%85%AE%E1%84%91%E1%85%A1+%E1%84%85%E1%85%A9%E1%84%80%E1%85%A9.PNG"
                  }
              }
          }]
      }
  };
}

Router.post('/myScore', async (req:Express.Request, res:Express.Response) => {
    let userId = req.body.userRequest.user.id;
    let code = "";
    if(req.body.action.params.EventName) {
      code = req.body.action.params.EventName.replace(/_/gi, " ");
    }
    let eventRule = await getEventRule(code);
    getAttendance(userId, eventRule[0]._id) 
    .then(data => {
        let responseBody;
        if(data.length === 0) {
          responseBody = fallBackResponse('아직 적립한 적이 없어요..!', code);
        }
        else {
          responseBody = {
            "version": "2.0",
            "template": {
              "outputs": [
                {
                    "basicCard": {
                        "title": `내 적립: ${data[0].log.length}`,
                        "description": data[0].eventRule.description,
                        "buttons": [{
                          "type": "message",
                          "label": "내적립현황",
                          "messageText": `myScore ${data[0].eventRule.code}`
                        },
                        {  // 현재는 static하게, 이후에 policy에 대해 불러올 것
                          "type": "block",
                          "label": "0개 보상받기",
                          "blockId": `5db59a4992690d0001a4f1ee`
                        }
                        ],
                        "thumbnail": {
                          "imageUrl": data[0].eventRule.imageUrl || "https://snuffstatic.s3.ap-northeast-2.amazonaws.com/%E1%84%89%E1%85%B3%E1%84%82%E1%85%AE%E1%84%91%E1%85%AE%E1%84%91%E1%85%A1+%E1%84%85%E1%85%A9%E1%84%80%E1%85%A9.PNG"
                        }
                    }
                }]
            }
          }
        }
        return res.status(200).send(responseBody);
    });
});

export default Router;
