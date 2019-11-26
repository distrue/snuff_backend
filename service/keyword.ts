import {KeywordModel} from '../models/keyword';
import { ObjectId } from 'bson';

export async function list() {
    try{
        return await KeywordModel.find({})
    }catch(err) {
        throw err;
    }
}

export async function find(phrase: string, random: boolean) {
    try{
        if(random) return await KeywordModel.aggregate([{$sample: {size: 10}}])
        else return await KeywordModel.find({phrase: phrase})
    }catch(err) {
        throw err;
    }
}

export async function addWord(phrase: string) {
    try{
        return await KeywordModel.create({
            phrase: phrase
        })
    }catch(err) {
        throw err;
    }
}

export async function addParticipant(phrase: string, participant: ObjectId) {
    try{
        return await KeywordModel.find({phrase: phrase})
        .then(async ans => {
            let idx = ans[0].participants.findIndex((item) => item === participant)
            if(idx === -1) ans[0].participants.push(participant)
            await ans[0].save()
        })
    }catch(err) {
        throw err;
    }
}

export async function deleteParticipant(phrase: string, participant: ObjectId) {
    try{
        return await KeywordModel.find({phrase: phrase})
        .then(async ans => {
            let idx = ans[0].participants.findIndex((item) => item === participant)
            if(idx !== -1) ans[0].participants.splice(idx, 1)
            await ans[0].save()
        })
    }catch(err) {
        throw err;
    }
}

