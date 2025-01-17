import {default as Instance} from 'express';
import * as Express from 'express';
import bodyParser from 'body-parser';
import logger from 'morgan';
import cors from 'cors';
import cookieParser from 'cookie-parser';

import {init as configInit} from './config';
import dbinit from './tools/mongodb';

import apiRouter from './routes/kakao_openbuilderi';
import adminRouter from './routes/admin';
import kakaoRouter from './routes/kakao_oauth';

const app = Instance();

app.set('view engine', 'ejs');
app.use(logger('dev', {}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

dbinit();

app.set('trustproxy', 1);
app.use(cors({
	credentials: true, // enable set cookie
	methods: ['GET', 'POST', 'PUT', 'DELETE'],
	origin: ['http://localhost:8000', 'https://snufoodfighter.firebaseapp.com']
  }));
app.use(cookieParser());

configInit();

app.use('/api', apiRouter);
app.use('/admin', adminRouter);
app.use('/kakao_oauth', kakaoRouter);

app.use("/static", Express.static(__dirname + '/static'));

app.get('/', function(req: Express.Request, res: Express.Response){
	res.send('snuff api server');
});
app.listen(3000, function(){
	console.log('Connected 3000 port');
});
