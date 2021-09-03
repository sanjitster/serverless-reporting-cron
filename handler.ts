import { Handler } from 'aws-lambda';
import { GetAwsConfig, IAWSConfig } from './lib/GetAwsConfig';

export const getConfig = async (): Promise<IAWSConfig> => {
  return await GetAwsConfig();
};

export const awsConfig: Handler = async () => {
  try {
    const config = await getConfig();
    return {
      statusCode: 200,
      // headers: {
      //   'Access-Control-Allow-Origin': '*',
      //   'Access-Control-Allow-Credentials': true
      // },
      body: JSON.stringify(config),
    };
  } catch (error) {
    return {
      statusCode: error.status || 500,
      // headers: {
      //   'Access-Control-Allow-Origin': '*',
      //   'Access-Control-Allow-Credentials': true
      // },
      body: JSON.stringify({ message: error.message.replace(/(\r\n|\n|\r)/gm, "").split(',') })
    };
  }
};
