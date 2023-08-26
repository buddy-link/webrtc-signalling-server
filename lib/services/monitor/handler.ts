import {SNSEvent} from "aws-lambda";

let webHookUrl: string | undefined;

export async function handler(event: SNSEvent) {
    if (! webHookUrl) {
        const secretPath = new URL('/secretsmanager/get', 'http://localhost:2773');
        secretPath.searchParams.set('secretId', 'webrtc-slack-webhook-url');
        const response = await fetch(secretPath.toString(), {
            headers: {
                'X-Aws-Parameters-Secrets-Token': process.env.AWS_SESSION_TOKEN!,
            }
        });
        webHookUrl = await response.text();
    }
    
    for(const record of event.Records) {
        await fetch(webHookUrl, {
            method: 'POST',
            body: JSON.stringify({
                "text": `Houston, we have a problem: ${record.Sns.Message}`
            })
        })
    }
}
