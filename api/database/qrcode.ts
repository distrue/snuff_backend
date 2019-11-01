import mongoose from 'mongoose';
import {QRcodeModel} from '../../models/qrcode';
import { ObjectId } from 'bson';

export async function add(type: string, code: string, expireDate: Date,  connectObject: ObjectId) {
    try {
        return await QRcodeModel.create({
            code: code,
            type: type,
            expireDate: expireDate,
            connectObject: connectObject
        });
    } catch (err) {
        throw err;
    }
}

export async function read(code: string) {
    try {
        let match = await QRcodeModel.find({qrcode: code});
        if(match.length === 0) return null;
        return match[0];
    } catch (err) {
        throw err;
    }
}
