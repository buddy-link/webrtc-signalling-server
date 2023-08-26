import {SNSEvent} from "aws-lambda";

let webHookUrl: string | undefined;

export async function handler(event: SNSEvent) {
    if (! webHookUrl) {
        console.log('Retrieving webhook URL.');
        const secretPath = new URL('/secretsmanager/get', 'http://localhost:2773');
        secretPath.searchParams.set('secretId', 'webrtc-slack-webhook-url');
        const response = await fetch(secretPath.toString(), {
            headers: {
                'X-Aws-Parameters-Secrets-Token': process.env.AWS_SESSION_TOKEN!,
            }
        });
        const data = await response.json();
        webHookUrl = data.SecretString;
    }
    
    for(const record of event.Records) {
        await fetch(webHookUrl!, {
            method: 'POST',
            body: JSON.stringify({
                "text": `Houston, we have a problem: ${record.Sns.Message}`
            })
        })
    }
}
