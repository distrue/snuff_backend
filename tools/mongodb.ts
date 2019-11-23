import logger from './logger';
import { getValue } from '../config';
import mongoose from 'mongoose';

export default function mongo_connect() {
  const db = getValue('dbUrl') ? getValue('dbUrl') : 'mongodb://localhost/snuff';
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
