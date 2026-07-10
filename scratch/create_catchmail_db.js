async function main() {
    const username = 'adarshdb_' + Math.random().toString(36).substring(2, 10);
    const domain = 'catchmail.io';
    const email = `${username}@${domain}`;
    console.log(`Generated Catchmail Email: ${email}`);

    // 1. Register bucket on kvdb.io
    const registerUrl = 'https://kvdb.io/';
    const params = new URLSearchParams();
    params.append('email', email);

    console.log('Registering bucket on kvdb.io...');
    const regRes = await fetch(registerUrl, {
        method: 'POST',
        body: params
    });

    if (!regRes.ok) {
        console.error(`Failed to register on kvdb.io: ${regRes.status}`);
        return;
    }

    const bucketId = await regRes.text();
    console.log(`Bucket Created! ID: ${bucketId}`);
    console.log('Awaiting verification email from kvdb.io...');

    // 2. Poll Catchmail for the activation email
    const pollUrl = `https://api.catchmail.io/api/v1/mailbox?address=${email}`;
    let verificationLink = null;

    for (let attempt = 1; attempt <= 15; attempt++) {
        await new Promise(resolve => setTimeout(resolve, 5000));
        console.log(`Checking inbox (attempt ${attempt}/15)...`);
        
        try {
            const listRes = await fetch(pollUrl);
            if (!listRes.ok) {
                console.log(`Polling status: ${listRes.status}`);
                continue;
            }
            const messages = await listRes.json();
            
            if (messages && messages.length > 0) {
                console.log(`Received ${messages.length} email(s). Reading verification email...`);
                
                // Read the latest message details
                const msgId = messages[0].id;
                const msgDetailsUrl = `https://api.catchmail.io/api/v1/message/${msgId}?mailbox=${email}`;
                const msgRes = await fetch(msgDetailsUrl);
                const msgData = await msgRes.json();
                
                // In catchmail, msgData.body or msgData.text contains the body
                const htmlContent = msgData.body || msgData.text || '';
                
                // Extract activation URL
                const match = htmlContent.match(/https:\/\/kvdb\.io\/[a-zA-Z0-9_\-\/]+/);
                if (match) {
                    verificationLink = match[0];
                    console.log(`Found Activation Link: ${verificationLink}`);
                    break;
                }
            }
        } catch (err) {
            console.error('Error polling email:', err);
        }
    }

    if (!verificationLink) {
        console.error('Verification email did not arrive.');
        return;
    }

    // 3. Activate the bucket
    console.log('Activating bucket...');
    const actRes = await fetch(verificationLink);
    const actText = await actRes.text();
    console.log(`Activation Response (Status ${actRes.status}):`);
    console.log(actText);

    // 4. Double check if we can write to the bucket now
    const testUrl = `https://kvdb.io/${bucketId}/reviews`;
    console.log('Testing write access to verified bucket...');
    const writeRes = await fetch(testUrl, {
        method: 'PUT',
        body: '[]'
    });

    console.log(`Test Write Status: ${writeRes.status}`);
    if (writeRes.status === 200 || writeRes.status === 201) {
        console.log('SUCCESS! Verified Bucket is ready for use.');
        console.log(`BUCKET_ID = ${bucketId}`);
    } else {
        console.error('Failed to write to bucket after activation.');
    }
}

main().catch(console.error);
