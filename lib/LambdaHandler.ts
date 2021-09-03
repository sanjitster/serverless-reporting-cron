export default function handler(lambda: any) {
    return async function (event: any, context: any) {
        let body: any, statusCode: number;

        try {
            // Run the Lambda
            body = await lambda(event, context);
            statusCode = 200;
        } catch (e) {
            if (e.length >= 1) {
                if (typeof e === 'string') {
                    e = e;
                } else {
                    e = e.map((m: any) => m.message.toString());
                }                
            } else if (e.message !== undefined) {
                e = e.message;
            }
            body = { error: e };
            statusCode = 500;
        }

        // Return HTTP response
        return {
            statusCode,
            body: JSON.stringify(body),
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Credentials": true,
            },
        };
    };
}