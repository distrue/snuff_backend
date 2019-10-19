import Express from 'express';
const Router = Express.Router();

import {list} from '../../api/database/review';
Router.post('/detailone', (req:Express.Request, res:Express.Response) => {
    let find = {name: {$regex: req.body.action.params.restaurant_name.replace(/_/gi, " ")}};
    console.log(find);
    list(find)
    .then(data => {
        let parseContent = data[0].content.replace(/\nReview:\n/, "스누푸파's Review: \n");
        parseContent = parseContent.replace(/\nReview：\n/, "스누푸파's Review: \n");
        parseContent = parseContent.replace(/\"/gi, "");
        parseContent = parseContent.replace(/<a.*>#/gi, "#");
        parseContent = parseContent.replace(/<\/a>/gi, "");
        const responseBody = {
            "version": "2.0",
            "template": {
              "outputs": [
                {
                    "basicCard": {
                        "description": parseContent
                    }
                }]
            }
        }
        res.status(200).send(responseBody);
    });
});

export default Router;
