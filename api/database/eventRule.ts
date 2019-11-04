import mongoose from 'mongoose';
import {EventRuleModel} from '../../models/eventRule';
import {AttendanceModel} from '../../models/attendance';


export async function eventRuleAdd(title: string, code: string, blockId: string, description: string, imageUrl: string) {
    try {
        return await EventRuleModel.create({
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

export async function getEventRule(code: string) {
    try {
        return await EventRuleModel.find({code: code});
    } catch (err) {
        throw err;
    }
}

export async function attendanceUpdate(userId: string, code: string) {
    try {
        // 존재하지 않을 경우
        let rule = await EventRuleModel.find({code: code});
        return await AttendanceModel.create({
            userId: userId,
            eventRule: mongoose.Types.ObjectId(rule[0]._id)
        });
    } catch (err) {
        throw err;
    }
}

export async function getAttendance(userId: string) {
    try {
        return await AttendanceModel.find({userId: userId}).populate('eventRule');
    } catch (err) {
        throw err;
    }
}
