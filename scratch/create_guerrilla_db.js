async function main() {
    console.log('Initializing Guerrilla Mail session...');
    const initRes = await fetch('https://api.guerrillamail.com/ajax.php?f=get_email_address');
    const initData = await initRes.json();
    
    const email = initData.email_addr;
    const sidToken = initData.sid_token;
    console.log(`Email generated: ${email}`);
    console.log(`SID Token: ${sidToken}`);

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

    // 2. Poll Guerrilla Mail for the activation email
    let verificationLink = null;

    for (let attempt = 1; attempt <= 20; attempt++) {
        await new Promise(resolve => setTimeout(resolve, 5000));
        console.log(`Checking inbox (attempt ${attempt}/20)...`);
        
        try {
            const checkUrl = `https://api.guerrillamail.com/ajax.php?f=check_email&seq=0&sid_token=${sidToken}`;
            const listRes = await fetch(checkUrl);
            const checkData = await listRes.json();
            
            const messages = checkData.list || [];
            
            if (messages && messages.length > 0) {
                // Filter messages that might be from kvdb.io
                const kvdbMsg = messages.find(m => m.mail_from.toLowerCase().includes('kvdb'));
                
                if (kvdbMsg) {
                    console.log(`Received activation email! ID: ${kvdbMsg.mail_id}. Fetching content...`);
                    
                    const fetchUrl = `https://api.guerrillamail.com/ajax.php?f=fetch_email&email_id=${kvdbMsg.mail_id}&sid_token=${sidToken}`;
                    const msgRes = await fetch(fetchUrl);
                    const msgData = await msgRes.json();
                    
                    const htmlContent = msgData.mail_body || '';
                    
                    // Extract activation URL
                    const match = htmlContent.match(/https:\/\/kvdb\.io\/[a-zA-Z0-9_\-\/]+/);
                    if (match) {
                        verificationLink = match[0];
                        console.log(`Found Activation Link: ${verificationLink}`);
                        break;
                    }
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
