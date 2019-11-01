import Express from 'express';
const Router = Express.Router();

import {owncouponAdd} from '../../api/database/coupon';

Router.post('/giveCoupon', (req:Express.Request, res:Express.Response) => {
    const blockId = req.body.action.params.blockId.toString();
    const userId = req.body.userRequest.user.id;
    const dateCut = req.body.action.params.expireDate.split('-');
    const expireDate = new Date(dateCut[0], dateCut[1], dateCut[2]);
    
    owncouponAdd(blockId, userId, expireDate) 
    .then(async data => {
        console.log(data);
        let datalist: any[] = [];
        res.status(200).send("ok");
    });
});

export default Router;
