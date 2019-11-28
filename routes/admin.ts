import Express  from 'express';
import path from 'path';
import mongoose from 'mongoose';
import {ObjectId} from 'bson';

import {couponAdd, couponList} from '../service/coupon';
import {OneTimeCodeModel} from '../models/coupon';
import {list, update, deleteOne} from '../service/review';
import {add, list as eventList, addParticipant, deleteParticipant} from '../service/event';
import {jwtSign} from '../tools/jwt';
import isAdmin from '../controllers/admin';
import {readCSV, addToDB} from '../tools/dbUpdater';
import {add as qrAdd, list as qrList} from '../service/qrcode';
import {eventRuleAdd, getEventRule} from '../service/eventRule';
import {list as keywordList, addWord, delWord, 
    addParticipant as addParticipantKey, find as keywordFind, 
    deleteParticipant as deleteParticipantKey, crawlParticiapnt} from '../service/keyword';

const Router = Express.Router();

Router.get('/login', async(req: Express.Request, res: Express.Response) => {
    return res.render("login");
})

Router.post('/login', async(req: Express.Request, res: Express.Response) => {
    let ans = req.body.password;
    if(ans === "hilite1!") {
        const token = jwtSign("admin");
        res.cookie('X-Access-Token', token);
        return res.status(200).render('admin');
    }
    return await setTimeout(() => res.status(200).render('noAdmin'), 2000);
})

Router.all(/^/, isAdmin);

Router.all('/logout', async(req: Express.Request, res: Express.Response) => {
    res.clearCookie('X-Access-Token');
    return res.status(200).send('logout!');
})

Router.put('/rating', async (req: Express.Request, res: Express.Response) => {
    try {
        console.log(req.body.raw)
        await readCSV(req.body.raw).then(addToDB);
        return res.status(200).send("ok");
    }
    catch(err) {
        return res.status(500).send(err);
    }
});

Router.get('/rating', async (req: Express.Request, res: Express.Response) => {
    let x = {}; 
    if(req.query.name) { x = {name: {$regex: req.query.name}}; }
    let show = await list(x);
    return res.status(200).json({show: show});
});

Router.post('/rating', async (req:Express.Request, res: Express.Response) => {
    try {
        console.log(req.body);
        let location = req.body.location;
        req.body.name = undefined; req.body.location = undefined;
        await update({_id: mongoose.Types.ObjectId(req.body._id)}, {rating: req.body, location: location});
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
        let ans = await deleteOne({_id: mongoose.Types.ObjectId(req.query.id)});
        return res.status(200).json({ans: ans});
    }
    catch(err) {
        console.log(err);
        return res.status(500).json({err: err});
    }
})

Router.post('/event/participant', async function(req, res) {
    try{
        let ans = await addParticipant(mongoose.Types.ObjectId(req.body.event), mongoose.Types.ObjectId(req.body.participant), req.body.reward);
        return res.status(200).json(ans);        
    }catch(err) {
        console.error(err);
        return res.status(500).send("Unintended Server error occured");
    }
})

Router.delete('/event/participant', async function(req, res) {
    try{
        let ans = await deleteParticipant(mongoose.Types.ObjectId(req.query.event), mongoose.Types.ObjectId(req.query.participant));
        return res.status(200).json(ans);        
    }catch(err) {
        console.error(err);
        return res.status(500).send("Unintended Server error occured");
    }
})

Router.post('/event', async function(req, res) {
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

Router.get('/QR', async(req: Express.Request, res: Express.Response) => {
    return res.status(200).json({ans: await qrList()});
})

Router.post('/addQR', async (req:Express.Request, res: Express.Response) => {
    return res.status(200).json({ans: await qrAdd("event", req.body.code, req.body.qrcode )});
})

Router.get('/OTcode', async (req:Express.Request, res: Express.Response) => {
    return res.status(200).json({ans: await OneTimeCodeModel.find()});
})

Router.post('/addOTCode', async (req: Express.Request, res: Express.Response) => {
    let ans = await OneTimeCodeModel.create({
        code: req.body.code,
        coupon: new ObjectId(req.body.coupon)
    });
    return res.status(200).json({ans: ans});
});

Router.get('/coupon', async(req: Express.Request, res: Express.Response) => {
    return res.status(200).json({ans: await couponList()});
})

Router.post('/addCoupon', async(req: Express.Request, res: Express.Response) => {
    return res.status(200).json({ans: await couponAdd(req.body.blockId, req.body.imageUrl, req.body.title)});
});

Router.get('/eventRule', async(req: Express.Request, res: Express.Response) => {
    return res.status(200).json({ans: await getEventRule("")});
});

Router.post('/addEventRule', async (req: Express.Request, res: Express.Response) => {
    let ans = await eventRuleAdd(req.body.title, req.body.code, req.body.blockId, req.body.description, req.body.imageUrl);
    return res.status(200).json(ans);
})

Router.get('/keyword', async (req: Express.Request, res: Express.Response) => {
    let ans = await keywordList();
    return res.status(200).json(ans);
})

Router.get('/keywordOne', async (req: Express.Request, res: Express.Response) => {
    let ans = await keywordFind(req.query.phrase, false)
    return res.status(200).json(ans);
})

Router.delete('/keyword', async (req: Express.Request, res: Express.Response) => {
    let ans = await delWord(req.query.phrase);
    return res.status(200).json(ans)
})

Router.post('/keyword/phrase', async (req: Express.Request, res: Express.Response) => {
    let ans = await addWord(req.body.phrase);
    return res.status(200).json(ans);
})

Router.post('/keyword/crawl', async (req: Express.Request, res: Express.Response) => {
    let ans = await crawlParticiapnt(req.body.phrase);
    return res.status(200).json(ans);
})

Router.post('/keyword/participant', async (req: Express.Request, res: Express.Response) => {
    let ans = await addParticipantKey(req.body.phrase, mongoose.Types.ObjectId(req.body.participant));
    return res.status(200).json(ans);
})

Router.delete('/keyword/participant', async (req: Express.Request, res: Express.Response) => {
    let ans = await deleteParticipantKey(req.query.phrase, mongoose.Types.ObjectId(req.query.participant));
    return res.status(200).json(ans);
})

Router.all('/', function(req, res) {
    res.sendFile(path.join(__dirname, '..', 'bundle', 'index.html'));
})

Router.get('/:route', function (req, res) {
    res.sendFile(path.join(__dirname, '..', 'bundle', String(req.params.route)));
});

export default Router;

/*
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
});*/
