
import AWS, { AWSError } from 'aws-sdk';

export class S3Service {

    private readonly s3Client: AWS.S3;

    constructor(
    ) {
        this.s3Client = new AWS.S3();
    }

    /**
     * Uploads S3 Service
     * @param key Directory of S3
     * @param content any
     * @returns Promise<AWS.S3.ManagedUpload.SendData>
     */
    public async upload(bucket: string, key: string, content: any): Promise<AWS.S3.ManagedUpload.SendData> {
        return await new Promise(async (resolve, reject) => {
            this.s3Client.upload({
                Bucket: bucket,
                Key: key,
                Body: content,
                ACL: 'public-read'
            }, (err: AWSError, data: AWS.S3.ManagedUpload.SendData) => {
                if (err) {
                    reject(new Error(err.message));
                } else {
                    resolve(data);
                }
            });
        });
    }
}
