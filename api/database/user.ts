import mongoose from 'mongoose';
import {UserModel} from '../../models/user';

export async function create(tmpcode: String) {
    // TODO: 중복 확인
    return await UserModel.create({
        kakaoid: "",
        nickname: "",
        tmpcode: tmpcode
    });
}