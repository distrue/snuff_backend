import {default as Instance} from 'express';
import * as Express from 'express';
import bodyParser from 'body-parser';
import logger from 'morgan';
import cors from 'cors';
import session from 'express-session';

import {init as configInit} from './config';
import dbsession from './mongodb';
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

app.use(dbsession());
app.use(cors());
app.use(session({
	cookie: {
		secure: false // TODO: to change session in http, change it to true in https
	  },
	  name: 'sid',
	  resave: false,
	  saveUninitialized: true,
	  secret: 'dhakhiuq32lhfi8yy1ilasho8u9'
}));

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
