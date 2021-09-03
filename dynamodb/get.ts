import { APIGatewayEvent } from 'aws-lambda';
import handler from "../lib/LambdaHandler";
import dynamoDb from "../lib/DynamoDB";

export const main = handler(async (event: APIGatewayEvent) => {
  const params = {
    TableName: process.env.tableName,
    Key: {
      cronId: event.pathParameters.id
    }
  };
  //
  const result = await dynamoDb.get(params);
  if (!result.Item) {
    throw new Error(`${event.pathParameters.id} - Cron not found.`);
  }
  //
  return result.Item;
});