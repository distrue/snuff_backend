import mongoose from 'mongoose';
import { CouponModel, OwnCouponModel } from '../../models/coupon';
import { ObjectId } from 'bson';

export async function couponAdd(type: string, code: string, expireDate: Date,  connectObject: ObjectId) {
    try {
        return await CouponModel.create({
            code: code,
            type: type,
            expireDate: expireDate,
            connectObject: connectObject
        });
    } catch (err) {
        throw err;
    }
}

export async function owncouponAdd(blockId: string, userId: string, expireDate: Date) {
    try {
        let display = await CouponModel.find({blockId: blockId});
        if(display.length !== 0) {
            return await OwnCouponModel.create({
                blockId: blockId,
                userId: userId,
                expireDate: expireDate,
                display: display[0]._id
            });
        }
        else {
            return await OwnCouponModel.create({
                blockId: blockId,
                userId: userId,
                expireDate: expireDate
            });
        }
    } catch (err) {
        throw err;
    }
}

export async function owncouponList(userId: string) {
    try {
        return await OwnCouponModel.find({userId: userId}).populate('display');
    } catch (err) {
        throw err;
    }
}
