import Express from 'express';
const Router = Express.Router();

import {list} from '../../api/database/event';

Router.post('/askEvent', (req:Express.Request, res:Express.Response) => {
    let find = "";
    if(req.body.action.params.restaurant_name) {
      find = req.body.action.params.restaurant_name.replace(/_/gi, " ");
    }
    list(find)
    .then(async data => {
        console.log(data);
        let datalist: any[] = [];
        await data.forEach(item => {
          datalist.push({
            "title":item.title,
            "thumbnail": {
              "imageUrl": item.imageUrl,
              "fixedRatio": true
            },
            "buttons":[
                {
                    "action": "block",
                    "label": "참여 방법",
                    "blockId": `${item.blockId}`
                },
                {
                  "action": "message",
                  "label": "참여매장보기",
                  "messageText": `eventFor ${item.code}`
              }
            ]
          });
        });
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
