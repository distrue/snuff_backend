import Express from 'express';
const Router = Express.Router();

import {getEventRule, eventRuleAdd} from '../../api/database/eventRule';

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


Router.post('/eventRule', (req:Express.Request, res:Express.Response) => {
    let find = "";
    if(req.body.action.params.EventName) {
      find = req.body.action.params.EventName.replace(/_/gi, " ");
    }

    getEventRule(find) 
    .then(async data => {
        let responseBody;
        
        if(data.length === 0) {
          responseBody = fallBackResponse("invalid eventCode");
          return res.status(200).send(responseBody);
        }

        responseBody = {
            "version": "2.0",
            "template": {
              "outputs": [
                {
                    "basicCard": {
                        "title": data[0].title,
                        "description": data[0].description,
                        "buttons": [{
                          "type": "message",
                          "label": "내적립현황",
                          "messageText": `myScore ${data[0].code}`
                        }
                        ],
                        "thumbnail": {
                          "imageUrl": data[0].imageUrl
                        }
                    }
                }]
            }
        }
        return res.status(200).json(responseBody);
    });
});

Router.post('/addEventRule', async (req: Express.Request, res: Express.Response) => {
  let responseBody;
  let ans = await eventRuleAdd(req.body.title, req.body.code, req.body.blockId, req.body.description, req.body.imageUrl);
  return res.status(200).json(responseBody);
})

export default Router;
