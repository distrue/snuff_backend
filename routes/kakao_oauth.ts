import Express from 'express';
import Axios from 'axios';
import querystring from 'querystring';

import {getValue} from '../config';
import {create} from '../api/database/user';

const Router = Express.Router();

Router.get('/', async (req: Express.Request, res: Express.Response) => {
    try {
        if(req.query.code) {
            let x = await create(req.query.code);
            const kakaoAppConfig = getValue('kakaoAppConfig');
            let ans = await Axios.post(`https://kauth.kakao.com/oauth/token`, querystring.stringify({
                grant_type: "authorization_code",
                client_id: kakaoAppConfig.clientId,
                redirect_uri: kakaoAppConfig.redirectUri,
                code: x.tmpcode
            }), {headers: {"Content-type": "application/x-www-form-urlencoded;charset=utf-8"}, withCredentials: true})
            .then(async (ans) => {
                let y = await x.update({access_token: ans.data.access_token, refresh_token: ans.data.refresh_token});
                return {res: ans.data, update: y};
            })
            .catch(err => {
                console.log(err);
                return {res: "failed", update: ''};
            })
            return res.status(200).json({user: ans.res, update: ans.update});
        }
        else {
            return res.status(400).json({err: req.query.error}); 
        }
    } catch(err) {
        return res.status(500).send(`Unintended Error occured in Express Server: ${err}`);
    }
});

export default Router;
