import Express  from 'express';
import path from 'path';

import {list, update, deleteOne} from '../api/database/review';
import {add, list as eventList} from '../api/database/event';
const Router = Express.Router();

Router.all('/logout', async(req: Express.Request, res: Express.Response) => {
    req.session!.isAdmin = false;
    return res.status(200).send('logout!');
})

Router.get('/isAdmin', async(req: Express.Request, res: Express.Response) => {
    return res.status(200).send(`Admin: ${req.session!.isAdmin}`);
})

Router.post(/^/, async(req: Express.Request, res: Express.Response, next: any) => {
    let ans = req.body.password;
    if(ans === "hilite1!") {
        req.session!.isAdmin = true;
        console.log(req.session!.isAdmin);
        return next();
    }
    return await setTimeout(() => {return(next());}, 2000);
})


Router.all(/^/, (req, res, next) => {
    console.log(req.session!.isAdmin);
    if(req.session!.isAdmin !== true) {
        return res.render("login", {isLogin: req.session!.isAdmin});
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
        let name = req.body.name.toString();
        let locationURL = ""; 
        if(req.body.locationURL) { locationURL = req.body.locationURL.toString(); }
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
        let ans = await deleteOne({name: {$regex: req.query.name.toString()}});
        return res.status(200).json({ans: ans});
    }
    catch(err) {
        console.log(err);
        return res.status(500).json({err: err});
    }
})

Router.all('/', function(req, res) {
    res.sendFile(path.join(__dirname, '..', 'bundle', 'index.html'));
})

Router.get('/:route', function (req, res) {
    res.sendFile(path.join(__dirname, '..', 'bundle', String(req.params.route)));
});


Router.put('/event', async function(req, res) {
    try {
        let ans = await add(req.body.title, req.body.code, req.body.blockId, req.body.description, req.body.imageUrl);
        return res.status(200).json(ans);
    } catch(err) {
        console.error(err);
        return res.status(500).send("Unintended Server error occured");
    }
});

Router.get('/event', async function(req, res) {
    try {
        let ans = await eventList("");
        return res.status(200).json(ans);
    } catch(err) {
        console.error(err);
        return res.status(500).send("Unintended Server error occured");
    }
});

export default Router;
