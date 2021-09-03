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
  await dynamoDb.delete(params);
  //
  return { status: true };
});
