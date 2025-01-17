import Express from 'express';
import Axios from 'axios';
import querystring from 'querystring';

import {getValue} from '../config';
import {create, find, remove} from '../service/user';

const Router = Express.Router();

Router.get('/secess', async(req: Express.Request, res: Express.Response) => {
    try {
        if(!req.user!.token) return res.status(401).send("check islogin first");
        let ans = await find({access_token: req.user!.token});
        if(ans.length === 0) return res.status(406).send("User does not exists");
        if(ans[0].nickname !== "") return res.status(200).json({isRegister:"true"});
        let profile = await Axios.get(`https://kapi.kakao.com/v1/user/unlink`, {headers: {"Content-type": "application/x-www-form-urlencoded;charset=utf-8", "Authorization": `Bearer ${req.user!.token}`}, withCredentials: true})
        .then(async (ans2) => {
            return ans2.data;
        })
        await remove({access_token: req.user!.token});
        return req.user!.destroy(() => {
            return res.status(200).json({secession: true, profile: profile});
        });
    } catch(err) {
        console.error(err);
        return res.status(500).send(`Unintended Error occured in Express Server: ${err}`);
    }
});

Router.get('/logout', async(req: Express.Request, res: Express.Response) => {
    try {
        if(!req.user!.token) return res.status(401).send("check islogin first");
        let ans = await find({access_token: req.user!.token});
        if(ans.length === 0) return res.status(406).send("User does not exists");
        if(ans[0].nickname !== "") return res.status(200).json({isRegister:"true"});
        let profile = await Axios.get(`https://kapi.kakao.com/v1/user/logout`, {headers: {"Content-type": "application/x-www-form-urlencoded;charset=utf-8", "Authorization": `Bearer ${req.user!.token}`}, withCredentials: true})
        .then(async (ans2) => {
            return ans2.data;
        })
        return req.user!.destroy(() => {
            return res.status(200).json({secession: true, profile: profile});
        });
    } catch(err) {
        console.error(err);
        return res.status(500).send(`Unintended Error occured in Express Server: ${err}`);
    }
});

Router.get('/register', async(req: Express.Request, res: Express.Response) => {
    try {
        if(!req.user!.token) return res.status(401).send("check islogin first");
        let ans = await find({access_token: req.user!.token});
        if(ans.length === 0) return res.status(406).send("User does not exists");
        if(ans[0].nickname !== "") return res.status(200).json({isRegister:"true"});
        let profile = await Axios.get(`https://kapi.kakao.com/v2/user/me`, {headers: {"Content-type": "application/x-www-form-urlencoded;charset=utf-8", "Authorization": `Bearer ${req.user!.token}`}, withCredentials: true})
        .then(async (ans2) => {
            if(ans2.data.kakao_account) {
                let y = await ans[0].update({kakao_account: ans2.data.kakao_account});
            }
            return ans2.data.kakao_account;
        })
        return res.status(200).json({isRegister: "false", profile: profile});
    } catch(err) {
        console.error(err);
        return res.status(500).send(`Unintended Error occured in Express Server: ${err}`);
    }
});

Router.get('/islogin', async(req: Express.Request, res: Express.Response) => {
    try {
        let ans = await find({access_token: req.user!.token});
        if(ans.length === 0) return res.status(200).json({islogin: false});
        req.user!.token = ans[0].access_token;
        return res.status(200).json({islogin: true});
    } catch(err) {
        console.error(err);
        return res.status(500).send(`Unintended Error occured in Express Server: ${err}`);
    }
});

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
            req.user!.token = ans.res.access_token;
            return res.status(200).redirect(`https://snufoodfighter.firebaseapp.com/login/?code=${req.query.code}`);
        }
        else {
            return res.status(400).json({err: req.query.error}); 
        }
    } catch(err) {
        console.error(err);
        return res.status(500).send(`Unintended Error occured in Express Server: ${err}`);
    }
});

export default Router;
