import { Validator } from 'jsonschema';

Validator.prototype.customFormats.frequencyFormat = function(input) {
    const later = require('@breejs/later');
    const l = later.parse.text(input);
    return l.error === -1;
};

export default class ValidationUtils {
    v: Validator;

    constructor() {
        this.v = new Validator();
        this.v.addSchema(require('../schema/dynamodb.json'), '/Crons');
    }

    validate(object: any, type: string | number) {
        let schema = this.v.schemas[type];
        return new Promise((resolve, reject) => {
            var validation = this.v.validate(object, schema);
            if (validation.errors.length > 0) {
                reject(validation.errors);
            }
            else {
                resolve();
            }
        });
    }
}
