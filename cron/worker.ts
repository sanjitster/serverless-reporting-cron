import { updateRow } from './../dynamodb/update';
import { sendSQS } from './../lib/Sqs';
import { APIGatewayEvent, APIGatewayProxyCallback } from "aws-lambda";
import handler from "../lib/LambdaHandler";
import dynamoDb from "../lib/DynamoDB";
import moment from "moment";
import filterAsync from 'node-filter-async';

export const main = handler(async (event: APIGatewayEvent, context: APIGatewayProxyCallback) => {
    const time = new Date();
    const params = {
        TableName: process.env.tableName,
        FilterExpression: '#active = :active',
        ExpressionAttributeNames: {
            '#active': 'active',
        },
        ExpressionAttributeValues: {
            ':active': true,
        },
    };
    //
    const result = await dynamoDb.scan(params)
        .then((collection) => {
            if (collection.Items.length >= 1) {
                const later = require('@breejs/later');
                const final = collection.Items.filter(d => {
                    if (moment(d.nextRun).isSame(time, 'minute')) {
                        if (d.lastRun === '' || !moment(d.lastRun).isSame(time, 'minute')) {
                            return d;
                        }
                    }
                    // if (later.schedule(later.parse.text(d.frequency)).isValid(time)) {
                    //     console.log('LastRunType:', typeof d.lastRun);
                    //     console.log('LastRun:', d.lastRun);
                    //     if (d.lastRun === '') {
                    //         return d;
                    //     } else if (!moment(d.lastRun).isSame(time, 'minute')) {
                    //         return d;
                    //     }
                    // }
                });
                return final;
            }
            return [];
        })
        .then(async (filteredCollection) => {
            const results = await filterAsync(filteredCollection, async (row) => {
                return (await sendSQSUpdateRuns(time, row)) === true;
            });
            return results;
        });
    //
    if (result.length >= 1) {
        console.log(`Your "Worker CRON" ran at ${time} with ${result.length} JOBS.`);
    } else {
        console.log(`Your "Worker CRON" ran at ${time} with no JOBS.`);
    }
})

export const sendSQSUpdateRuns = async (runDate: Date, data: any, updateRuns = true): Promise<{}> => {
    try {
        const run = await sendSQS(data)
            .then((queue) => {
                return new Promise(async (resolve, reject) => {
                    if (updateRuns) {
                        try {
                            const later = require('@breejs/later');
                            // const l = later.parse.text(data.frequency);
                            const upRuns = await updateRow(data.cronId, {
                                nextRun: new String(JSON.stringify(later.schedule(later.parse.text(data.frequency)).next(1))).slice(1, -1) || '',
                                lastRun: moment(runDate).utc(true).format()
                            });
                            resolve(queue);
                        } catch (error) {
                            reject(new Error(error.message));
                        }
                    } else {
                        resolve(queue);
                    }
                });
            });
        return run;
    } catch (error) {
        throw new Error(error.message);
    }
};
