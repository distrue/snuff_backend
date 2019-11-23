import Express from 'express';
const Router = Express.Router();

import {viewTitle} from '../../service/search';
import {list} from '../../service/review';
Router.post('/pictureone', (req:Express.Request, res:Express.Response) => {
    let find = {name: {$regex: req.body.action.params.restaurant_name.replace(/_/gi, " ")}};
    console.log(find);
    list(find)
    .then(data => {
        let datalist: any[] = [];
        let imgURLs = data[0].imgUrls;
        for(let idx in imgURLs) {
          if(datalist.length >= 10) break;
          datalist.push({
            "title":viewTitle(data[0].name),
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
