import mongoose from 'mongoose';
import {EventModel} from '../../models/event';
import { ObjectId } from 'bson';
import {list as reivewList} from './review';

export async function add(title: string, code: string, blockId: string, description: string, imageUrl: string) {
    try {
        return await EventModel.create({
            title: title,
            code: code,
            blockId: blockId,
            description: description,
            imageUrl: imageUrl,
            participants: []
        });
    } catch (err) {
        throw err;
    }
}

export async function one(code: string) {
    try {
        if(!code) return null;
        return await EventModel.find({code: code});
    } catch (err) {
        throw err;
    }
}

export async function list(participant: string) {
    try {
        let query: any = {};
        if(participant) {
            let event = await EventModel.find({}).populate({
                path: 'participants',
                select: 'name',
                match: { name: {"$regex": participant }}
            });
            return event;
        }
        else {
            return await EventModel.find({});           
        }
    } catch (err) {
        throw err;
    }
}

export async function targets(code: string) {
    try {
        let query = { "code": {"$regex": code} };
        return await EventModel.find(query).populate('participants');
    } catch (err) {
        throw err;
    }
}
