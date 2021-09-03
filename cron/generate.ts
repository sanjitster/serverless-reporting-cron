import { sendSQSUpdateRuns } from './worker';
import { processOut } from './../lib/ReportOut';
import { APIGatewayEvent, APIGatewayProxyCallback } from 'aws-lambda';
import handler from "../lib/LambdaHandler";
import dynamoDb from "../lib/DynamoDB";
import { getReport } from '../lib/Giift';

export const main = handler(async (event: APIGatewayEvent, context: APIGatewayProxyCallback) => {
    try {
        const params = {
            TableName: process.env.tableName,
            Key: {
                cronId: event.pathParameters.id
            }
        };
        const report = await dynamoDb.get(params)
            .then((result) => {
                if (!result.Item || !result.Item.active) {
                    throw new Error(`${event.pathParameters.id} - Active Cron not found.`);
                }
                return sendSQSUpdateRuns(new Date(), result.Item, false);
                // return new Promise(async (resolve, reject) => {
                //     try {
                //         const t = await getReport(result.Item.scope, result.Item.report, result.Item.input)
                //             .then(content => {
                //                 // console.log('Content', content);
                //                 return processOut(result.Item.name, result.Item.output, content);
                //             })
                //         resolve(t);
                //     } catch (e) {
                //         reject(e)
                //     }
                // });
            });
        return report;
    } catch (error) {
        throw new Error(error);
    }
});
