import AWS from 'aws-sdk'
AWS.config.update({ region: 'ap-southeast-1' });

export const sendSQS = async (data: any): Promise<any> => {
    return await new Promise(async (resolve, reject) => {
        const params = {
            MessageBody: JSON.stringify(data),
            QueueUrl: process.env.SQS_QUEUE_URL,
            MessageGroupId: '4c68708d-afa0-4438-9790-e0c0e4d3f60e',
            // MessageDeduplicationId: data.cronId
        }
        //
        const SQS = new AWS.SQS({ apiVersion: '2012-11-05' });
        SQS.sendMessage(params, (err) => {
            if (err) {
                reject(new Error(err.message));
            } else {
                resolve({
                    message: `Report ${data.name} added to queue.`,
                    data
                });
            }
        })
    });
}