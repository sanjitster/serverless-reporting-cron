import mkdirp from 'mkdirp';
import os from 'os';
import path from 'path';
import * as uuid from "uuid";

export interface ISaveFileOutPut {
    fileName: string;
    fileDirectory: string;
    extension: string;
    body: any;
};

export class SaveFile {

    private _EXT: string = 'txt';
    private _FileName: string = '';
    private _Dir: string = path.join(os.tmpdir(), uuid.v1());

    get extension(): string {
        return this._EXT;
    }

    setExtension(ext: string): SaveFile {
        this._EXT = ext;
        return this;
    }

    get fileName(): string {
        return this._FileName;
    }

    setFileName(name: string): SaveFile {
        this._FileName = name.replace(/\\|\//g,'_').split(' ').join('_').toLowerCase();
        return this;
    }

    get directory(): string {
        return this._Dir;
    }

    setDirectory(dir: string): SaveFile {
        this._Dir = dir;
        return this;
    }

    public async save(body: any): Promise<ISaveFileOutPut> {
        return await new Promise(async (resolve, reject) => {
            try {
                const filePath = await mkdirp(this.directory);
                const fs = require('fs');
                fs.readdir(filePath, (err: Error) => {
                    if (err) {
                        reject(err);
                    } else {
                        const dirFull: string = `${filePath}/${this.fileName}.${this.extension}`;
                        fs.writeFile(dirFull, body, async (err: Error) => {
                            if (err) {
                                console.log('Error File', err);
                                reject(err);
                            } else {
                                resolve({
                                    body,
                                    fileDirectory: dirFull,
                                    fileName: this.fileName,
                                    extension: this.extension
                                });
                            }
                        });
                    }
                });
            } catch (error) {
                reject(error.message);
            }
        });
    }

    /**
     * Gets Folder Name
     * @returns string
     */
    public static getFolderName(): string {
        const date = new Date(Date.now());
        return `${date.getFullYear()}/${('0' + (date.getMonth() + 1)).slice(-2)}/${('0' + date.getDate()).slice(-2)}`;
    }
}
