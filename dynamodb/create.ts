import { APIGatewayEvent } from 'aws-lambda';
import * as uuid from "uuid";
import handler from "../lib/LambdaHandler";
import dynamoDb from "../lib/DynamoDB";
import ValidationUtils from '../lib/ValidationUtils';

export const main = handler(async (event: APIGatewayEvent) => {
    const validation = new ValidationUtils();
    const body = JSON.parse(event.body);
    const params = {
        TableName: process.env.tableName,
        Item: Object.assign({
            cronId: uuid.v1(),
            nextRun: '',
            lastRun: ''
        }, body)
    };
    //
    await validation.validate(body, "/Crons").then(() => {
        if (params.Item.active === true) {
            const later = require('@breejs/later');
            const l = later.parse.text(params.Item.frequency);
            params.Item.nextRun = new String(JSON.stringify(later.schedule(l).next(1))).toString().replace(/\"/g, "") || '';
        }
        //
        return dynamoDb.put(params);
    });
    return params.Item;
});
