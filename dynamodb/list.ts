import { APIGatewayEvent } from 'aws-lambda';
import handler from "../lib/LambdaHandler";
import dynamoDb from "../lib/DynamoDB";

export const main = handler(async (event: APIGatewayEvent) => {
    const params = {
        TableName: process.env.tableName
    };
    const result = await dynamoDb.scan(params);
    //
    return result.Items;
});
