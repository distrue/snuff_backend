import Express from 'express';
const Router = Express.Router();

import {list} from '../../api/database/review';
Router.post('/ratingone', (req:Express.Request, res:Express.Response) => {
    let find = {name: {$regex: req.body.action.params.restaurant_name.replace(/_/gi, " ")}};
    list(find)
    .then(data => {
        let parseContent = data[0].content.replace(/\nReview:\n/, "");
        parseContent = parseContent.replace(/\"/gi, "");
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
