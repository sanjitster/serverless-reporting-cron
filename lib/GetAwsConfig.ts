import AWS from 'aws-sdk';

export interface IAWSConfig {
    baseUrl?: string;
    clientId?: string;
    clientSecret?: string;
    bucket?: string;
}

export async function GetAwsConfig(): Promise<IAWSConfig> {
    const data = await (new AWS.SSM({ apiVersion: '2014-11-06', region: 'ap-southeast-1' }))
        .getParameters({
            Names: [
                'reportingCron.baseUrl',
                'reportingCron.clientId',
                'reportingCron.clientSecret',
                'reportingCron.bucket'
            ]
        }).promise();
    const parameters = data.Parameters;
    return {
        baseUrl: getValue('reportingCron.baseUrl', parameters),
        clientId: getValue('reportingCron.clientId', parameters),
        clientSecret: getValue('reportingCron.clientSecret', parameters),
        bucket: getValue('reportingCron.bucket', parameters),
    };
}

function getValue(key: string, parameters: AWS.SSM.Parameter[]): string | null {
    const items = parameters.filter((parameter) => parameter.Name === key);
    return items.length === 1 ? items[0].Value : null;
}
