import { APIGatewayEvent } from 'aws-lambda';
import handler from "../lib/LambdaHandler";
import dynamoDb from "../lib/DynamoDB";
import { PromiseResult } from 'aws-sdk/lib/request';
import { DocumentClient } from 'aws-sdk/clients/dynamodb';
import { AWSError } from 'aws-sdk';
import ValidationUtils from '../lib/ValidationUtils';

export const main = handler(async (event: APIGatewayEvent) => {
    const data = JSON.parse(event.body);
    const validation = new ValidationUtils();
    //
    await validation.validate(data, "/Crons").then(async () => {
        if (data.active === true) {
            const later = require('@breejs/later');
            const l = later.parse.text(data.frequency);
            data.nextRun = new String(JSON.stringify(later.schedule(l).next(1))).toString().replace(/\"/g, "") || '';
        } else {
            data.nextRun = '';
        }
        //
        return await updateRow(event.pathParameters.id, data);
    });
    //
    return { status: true };
});

export const updateRow = async (id: string, data: any): Promise<PromiseResult<DocumentClient.UpdateItemOutput, AWSError>> => {
    const expression = generateUpdateQuery(data)
    const params = {
        TableName: process.env.tableName,
        Key: {
            cronId: id
        },
        ReturnValues: "ALL_NEW",
        ...expression
    };

    return await dynamoDb.update(params);
}

const generateUpdateQuery = (fields: { [s: string]: unknown; } | ArrayLike<unknown>) => {
    let exp = {
        UpdateExpression: 'set',
        ExpressionAttributeNames: {},
        ExpressionAttributeValues: {}
    }
    Object.entries(fields).forEach(([key, item]) => {
        exp.UpdateExpression += ` #${key} = :${key},`;
        exp.ExpressionAttributeNames[`#${key}`] = key;
        exp.ExpressionAttributeValues[`:${key}`] = item
    })
    exp.UpdateExpression = exp.UpdateExpression.slice(0, -1);
    return exp
}
