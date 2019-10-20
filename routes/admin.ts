import Express  from 'express';
import path from 'path';

import {list, update, deleteOne} from '../api/database/review';
const Router = Express.Router();

Router.get('/login', async(req: Express.Request, res: Express.Response) => {
    return res.status(200).render('login');
})

Router.post('/login', async(req: Express.Request, res: Express.Response) => {
    let ans = req.body.password;
    if(ans === "hilite1!") {
        req.session!.isAdmin = true;
        return res.status(200).redirect('/admin');
    }
    return await setTimeout(() => {return(res.status(200).render('login'))}, 2000);
})

Router.get('/logout', async(req: Express.Request, res: Express.Response) => {
    req.session!.isAdmin = false;
    return res.status(200).send('logout!');
})

Router.get('/isAdmin', async(req: Express.Request, res: Express.Response) => {
    return res.status(200).send(`Admin: ${req.session!.isAdmin}`);
})

Router.all(/^/, (req, res, next) => {
    if(req.session!.isAdmin !== true) {
        return res.render("Unauthorized");
    }
    return next();
})

Router.get('/ranking', async (req: Express.Request, res: Express.Response) => {
    let show = await list();
    let rankingList:any = {};
    for(let _item in show) {
        let item = show[_item];
        let total = Number(item.rating!.taste) + Number(item.rating!.quantity) + Number(item.rating!.atmosphere) + Number(item.rating!.service); total /= 4;
        if(!(String(total) in rankingList)) rankingList[String(total)] = [];
        rankingList[String(total)].push(item.name);
    }
    let ord = Object.keys(rankingList); ord.sort(function(a, b){
        if (Number(a) > Number(b)) return 1;
        else return -1;
    });
    let Str = "";
    for(let _now in ord) {
        let now = ord[_now];
        Str += `${now}: ${rankingList[now].length}\n`;
    }
    return res.status(200).send(Str);
});

Router.get('/rating', async (req: Express.Request, res: Express.Response) => {
    let x = {}; 
    if(req.query.name) { x = {name: {$regex: req.query.name}}; }
    let show = await list(x);
    let str = show[0].imgUrls;
    return res.status(200).json({show: show, img: str});
});

Router.post('/rating', async (req:Express.Request, res: Express.Response) => {
    try {
        console.log(req.body);
        let name = req.body.name.toString(); let locationURL = req.body.locationURL.toString();
        req.body.name = undefined; req.body.locationURL = undefined;
        await update({name: {$regex: name}}, {rating: req.body, locationURL: locationURL});
        return res.status(200).json({ok: true});
    }
    catch(err) {
        console.log(err);
        return res.status(500).json({err: err});
    }
})

Router.delete('/rating', async (req: Express.Request, res: Express.Response) => {
    try {
        console.log(req.query);
        let ans = await deleteOne({name: req.query.name.toString()});
        return res.status(200).json({ans: ans});
    }
    catch(err) {
        console.log(err);
        return res.status(500).json({err: err});
    }
})

Router.get('/', function(req, res) {
    res.redirect('/admin/index.html');
})

Router.get('/:route', function (req, res) {
    res.sendFile(path.join(__dirname, '..', 'bundle', String(req.params.route)));
});

export default Router;
