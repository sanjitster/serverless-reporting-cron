import { processOut } from './../lib/ReportOut';
import { getReport } from './../lib/Giift';
import handler from "../lib/LambdaHandler";

export const main = handler(async (event: any) => {
    const body = JSON.parse(event.Records[0].body);
    const t = await getReport(body.scope, body.report, body.input).then(content => processOut(body.name, body.output, content));
    return t;
});