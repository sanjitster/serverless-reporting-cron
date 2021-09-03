import { IGiiftReportClean } from './Giift';
import { INodeMailerConfig, NodeMailer, INodeMailerMailOptions } from './NodeMailer';
import { S3Service } from './S3';
import { SaveFile } from './SaveFile';
import moment from "moment";
import converter from "json-2-csv";

export interface IReportOut {
    type: string;
    s3?: string;
    email?: IReportOutEmail;
}

export interface IReportOutEmail {
    receiver: string;
    template: string;
    attach: boolean;
}

export const processOut = async (reportName: string, config: IReportOut, data: IGiiftReportClean): Promise<any> => {
    return new Promise(async (resolve, reject) => {
        if (data.data.length >= 1) {
            // Unix SS timestamp
            const fileName = (data.suggested_filename !== '') ? data.suggested_filename : moment().format('x').toString();
            if (config.type.toLowerCase() === 'csv') {
                if (config.s3 !== undefined) {
                    console.log('Running CSV S3');
                    try {
                        const csvS3 = await CsvS3(`${fileName}.${config.type.toLowerCase()}`, data.data, config);
                        resolve(csvS3);
                    } catch (error) {
                        reject(error);
                    }
                } else if (config.email !== undefined) {
                    console.log('Running CSV Email');
                    try {
                        const csvEmail = await CsvEmail(reportName || '', fileName, data.data, config);
                        resolve(csvEmail);
                    } catch (error) {
                        reject(error);
                    }
                } else {
                    reject(new Error('Out Processing for type: .CSV'));
                }
            } else if (config.type.toLowerCase() === 'json') {
                if (config.s3 !== undefined) {
                    try {
                        const jsonS3 = await JsonS3(`${fileName}.${config.type.toLowerCase()}`, data.data, config);
                        resolve(jsonS3);
                    } catch (error) {
                        reject(error);
                    }
                } else if (config.email !== undefined) {
                    try {
                        const jsonEmail = await JsonEmail(reportName || '', fileName, data.data, config);
                        resolve(jsonEmail);
                    } catch (error) {
                        reject(error);
                    }
                } else {
                    reject(new Error('Out Processing for type: .JSON'));
                }
            }
        }
        resolve(data.data);
    });
};

export const CsvS3 = async (filename: string, content: any, config: IReportOut): Promise<AWS.S3.ManagedUpload.SendData> => {
    return new Promise(async (resolve, reject) => {
        try {
            const run = await convertJson2Csv(content).then((file) => new S3Service().upload(process.env.S3Bucket, `${config.s3}${filename}`, file));
            resolve(run);
        } catch (error) {
            reject(error);
        }
    });
};

export const JsonS3 = async (filename: string, content: any, config: IReportOut): Promise<AWS.S3.ManagedUpload.SendData> => {
    return new Promise(async (resolve, reject) => {
        try {
            const run = await new S3Service().upload(process.env.S3Bucket, `${config.s3}${filename}`, content);
            resolve(run);
        } catch (error) {
            reject(error);
        }
    });
};

export const CsvEmail = async (reportName: string, filename: string, content: any, config: IReportOut): Promise<string> => {
    return new Promise(async (resolve, reject) => {
        try {
            const run = await convertJson2Csv(content)
                .then((data) => new SaveFile().setFileName(filename).setExtension(config.type.toLowerCase()).save(data))
                .then((file) => {
                    const message: INodeMailerMailOptions = {
                        subject: `Report "${reportName}" is ready`,
                        to: config.email.receiver,
                        from: 'reporting@giift.com'
                    };
                    if (config.email.attach) {
                        message.attachments = [{
                            path: `${file.fileDirectory}`
                        }];
                    }
                    return new NodeMailer().setBody(config.email.template, { name: reportName }).sendMail(message);
                });
            resolve(run);
        } catch (error) {
            reject(error);
        }
    });
};

export const JsonEmail = async (reportName: string, filename: string, content: any, config: IReportOut): Promise<string> => {
    return new Promise(async (resolve, reject) => {
        try {
            const run = await new SaveFile().setFileName(filename).setExtension(config.type.toLowerCase()).save(content)
                .then((file) => {
                    const message: INodeMailerMailOptions = {
                        subject: `Report "${reportName}" is ready`,
                        to: config.email.receiver,
                        from: 'reporting@giift.com'
                    };
                    if (config.email.attach) {
                        message.attachments = [{
                            path: `${file.fileDirectory}`
                        }];
                    }
                    return new NodeMailer().setBody(config.email.template, { name: reportName }).sendMail(message);
                });
            resolve(run);
        } catch (error) {
            reject(error);
        }
    });
};

export const convertJson2Csv = (content: []): Promise<string> => {
    return new Promise((resolve, reject) => {
        converter.json2csv(content, (err, csv) => {
            if (err) {
                reject(new Error(err.message));
            }
            resolve(csv);
        });
    });
};
