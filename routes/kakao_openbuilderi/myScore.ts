import Express from 'express';
const Router = Express.Router();

import {getAttendance} from '../../api/database/eventRule';

function fallBackResponse(txt:string) {
  return {
      "version": "2.0",
      "template": {
        "outputs": [
          {
              "basicCard": {
                  "title": txt,
                  "buttons": [],
                  "thumbnail": {
                      "imageUrl": "https://snuffstatic.s3.ap-northeast-2.amazonaws.com/%E1%84%89%E1%85%B3%E1%84%82%E1%85%AE%E1%84%91%E1%85%AE%E1%84%91%E1%85%A1+%E1%84%85%E1%85%A9%E1%84%80%E1%85%A9.PNG"
                  }
              }
          }]
      }
  };
}

Router.post('/myScore', (req:Express.Request, res:Express.Response) => {
    let find = "";
    if(req.body.action.params.EventName) {
      find = req.body.action.params.EventName.replace(/_/gi, " ");
    }
    getAttendance(find) 
    .then(data => {
        let responseBody;

        if(data.length === 0) {
          responseBody = fallBackResponse('아직 적립한 적이 없어요..!');
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
