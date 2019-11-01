import Express  from 'express';
const Router = Express.Router();

import reviewMode from './reviewMode';
Router.use(reviewMode);

import recommendMode from './recommendMode';
Router.use(recommendMode);

import detailone from './detailone';
Router.use(detailone);

import pictureone from './pictureone';
Router.use(pictureone);

import ranking from './ranking';
Router.use(ranking);

import reviewRequest from './reviewRequest';
Router.use(reviewRequest);

import ratingone from './ratingone';
Router.use(ratingone);

import askEvent from './askEvent';
Router.use(askEvent);

import askLocation from './askLocation';
Router.use(askLocation);

import eventTgt from './eventTgt';
Router.use(eventTgt);

import validateQr from './validateqr';
Router.use(validateQr);

import myScore from './myScore';
Router.use(myScore);

import eventRule from './eventRule';
Router.use(eventRule);

import couponList from './couponList';
Router.use(couponList);

import giveCoupon from './giveCoupon';
Router.use(giveCoupon);

export default Router;
