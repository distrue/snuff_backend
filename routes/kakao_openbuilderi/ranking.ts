import Express from 'express';
const Router = Express.Router();

import {list} from '../../service/review';
Router.get('/ranking', (req:Express.Request, res:Express.Response) => {
    let find = {name: {$regex: req.query.name.replace(/_/gi, " ")}};
    console.log(find);
    list(find)
    .then(data => {
        if(data.length === 0) return res.status(404).json("Not found");
        let ret = {rating: data[0].rating, title: data[0].name, ranking: 0}; 
        switch(String(data[0].rating.total)) {
            case "4.875":
                ret.ranking = 1;
            case "4.75":
                ret.ranking = 3;
            case "4.625":
                ret.ranking = 9;
            case "4.5":
                ret.ranking = 22;
            case "4.375":
                ret.ranking = 48;
            case "4.25":
                ret.ranking = 85;
            case "4.125":
                ret.ranking = 125;
            case "4":
                ret.ranking = 167;
            case "3.875":
                ret.ranking = 201;
            case "3.75":
                ret.ranking = 224;
            case "3.625":
                ret.ranking = 238;
            case "3.5":
                ret.ranking = 243;
            case "3.375":
                ret.ranking = 246;
        }
        return res.status(200).json(ret);
    });
});

export default Router;
