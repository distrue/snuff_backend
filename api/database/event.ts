import {EventModel} from '../../models/event';
import { ObjectId } from 'bson';

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

export async function list(participant: string) {
    try {
        let query: any = {};
        if(participant) {
            query = {
                "participants": {
                    "$elemMatch":{
                        "$regex": participant
                    }
                }
            };
        }
        return await EventModel.find(query);
    } catch (err) {
        throw err;
    }
}

export async function targets(code: ObjectId) {
    try {
        let query = {
            "code": {
                "$regex": code
            }
        };
        return await EventModel.find(query).populate('participants');
    } catch (err) {
        throw err;
    }
}
