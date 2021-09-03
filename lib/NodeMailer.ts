import nodemailer from 'nodemailer';
import _ from 'lodash';
import Mail from 'nodemailer/lib/mailer';
import { readFileSync, readdirSync } from 'fs';

export interface INodeMailerConfig {
    host: string;
    port: number;
    secure: boolean;
    auth: INodeMailerConfigAuth;
}

export interface INodeMailerConfigAuth {
    user: string;
    pass: string;
}

export interface INodeMailerMailOptions extends Mail.Options { }

export class NodeMailer {

    private Mailer: Mail;
    private config: INodeMailerConfig = {
        host: "",
        port: 266,
        secure: true,
        auth: {
            user: "",
            pass: ""
        }
    };
    private _defaultBody = '_default';
    private _templateBody = '';

    constructor(c?: INodeMailerConfig) {
        this.Mailer = nodemailer.createTransport(_.assign(this.config, c || {}));
    }

    get body(): string {
        return this._templateBody;
    }

    setBody(name: string, contentReplace: any = {}): NodeMailer {
        const fs = require('fs');
        const path = require("path");
        try {
            this._templateBody = readFileSync(path.resolve(__dirname, `../templates/emails/${name}.html`), 'utf8');
        } catch (error) {
            this._templateBody = readFileSync(path.resolve(__dirname, `../templates/emails/${this._defaultBody}.html`), 'utf8');
        }
        //
        if (Object.keys(contentReplace).length !== 0) {
            this._templateBody = this.replaceAll(this._templateBody, '%name%', contentReplace.name || '');
        }
        return this;
    }

    private replaceAll(str: string, find: string, replace: string): string {
        var escapedFind = find.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
        return str.replace(new RegExp(escapedFind, 'g'), replace);
    }

    sendMail(mailOptions: INodeMailerMailOptions): Promise<string> {
        return new Promise(async (resolve, reject) => {
            if (this._templateBody === '') {
                reject(new Error('Invalid email Body'));
            } else if (_.isEmpty(mailOptions)) {
                reject(new Error('Invalid mail objects'));
            } else {
                try {
                    let info = await this.Mailer.sendMail({
                        ...mailOptions, ...{
                            html: this._templateBody
                        }
                    });
                    console.log(`Message sent: ${info.messageId}`);
                    resolve(`Message sent: ${info.messageId}`);
                } catch (err) {
                    console.log('Email Sending Error: ', err);
                    reject(new Error(err));
                }
            }
        });
    }
}