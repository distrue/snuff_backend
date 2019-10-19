import logger from './logger';
import connectMongo from 'connect-mongo';
import session from 'express-session';
import mongoose from 'mongoose';

function mongo_connect() {
  const db = process.env.DBURL ? process.env.DBURL : 'mongodb://localhost/snuff';
  logger.info('DB', db);
  mongoose.connect(db, {
    useNewUrlParser: true
  }).then(() => {
    logger.info('Connected to MONGODB', 'app');
  }).catch(async (err:any) => {
    logger.error(err, 'app');
    await setTimeout(mongo_connect, 3000);
  });
}
export default () => {
  console.log("TT");
  mongo_connect();

  const MongoStore = connectMongo(session);
  const appSession = session({
    cookie: {
      secure: true
    },
    name: 'sid',
    resave: true,
    saveUninitialized: true,
    // TODO: Change secret
    secret: 'my-secret',
    store: new MongoStore({
      mongooseConnection: mongoose.connection
    })
  });
  return appSession;
}
