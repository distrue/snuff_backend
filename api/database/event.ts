import {EventModel} from '../../models/event';

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

export async function targets(code: string) {
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
