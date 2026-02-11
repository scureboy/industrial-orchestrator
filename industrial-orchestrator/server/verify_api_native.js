const fs = require('fs');
const path = require('path');

const API_URL = 'http://127.0.0.1:3000/api';

async function runTest() {
    console.log('--- STARTING API VERIFICATION (v8.0 NATIVE) ---');
    try {
        // 1. Register
        console.log('1. Registering test user...');
        const regRes = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: 'Tester Native',
                email: `test_native_${Date.now()}@test.com`,
                password: 'password123',
                role: 'Investor'
            })
        });
        const regData = await regRes.json();
        if (!regRes.ok) throw new Error(`Reg failed: ${JSON.stringify(regData)}`);

        const token = regData.token;
        const userId = regData.user.id;
        console.log('   Success! User ID:', userId);

        const authHeader = { 'Authorization': `Bearer ${token}` };

        // 2. Start Interaction
        console.log('2. Starting interaction...');
        const intRes = await fetch(`${API_URL}/interactions`, {
            method: 'POST',
            headers: { ...authHeader, 'Content-Type': 'application/json' },
            body: JSON.stringify({
                receiver_id: userId,
                project_name: 'Test Project Native',
                type: 'Propose Project'
            })
        });
        const intData = await intRes.json();
        if (!intRes.ok) throw new Error(`Int failed: ${JSON.stringify(intData)}`);
        const intId = intData.id;
        console.log('   Success! Interaction ID:', intId);

        // 3. Send Message
        console.log('3. Sending persistent message...');
        const msgRes = await fetch(`${API_URL}/messages`, {
            method: 'POST',
            headers: { ...authHeader, 'Content-Type': 'application/json' },
            body: JSON.stringify({
                interaction_id: intId,
                text: 'Hello from native fetch test'
            })
        });
        const msgData = await msgRes.json();
        if (!msgRes.ok) throw new Error(`Msg failed: ${JSON.stringify(msgData)}`);
        console.log('   Success! Message ID:', msgData.id);

        // 4. Verify Messages
        console.log('4. Verifying message retrieval...');
        const getMsgRes = await fetch(`${API_URL}/messages/interaction/${intId}`, { headers: authHeader });
        const getMsgData = await getMsgRes.json();
        if (getMsgData.length > 0) {
            console.log('   Success! Found messages:', getMsgData.length);
        } else {
            throw new Error('Message not found after save');
        }

        // 5. Upload Document
        console.log('5. Uploading document...');
        // Manual Multipart construction
        const boundary = '----Boundary' + Math.random().toString(16);
        const fileName = 'test-native.txt';
        const fileContent = 'Hello Native Fetch';

        let body = '';
        body += `--${boundary}\r\n`;
        body += `Content-Disposition: form-data; name="interaction_id"\r\n\r\n${intId}\r\n`;
        body += `--${boundary}\r\n`;
        body += `Content-Disposition: form-data; name="document"; filename="${fileName}"\r\n`;
        body += `Content-Type: text/plain\r\n\r\n${fileContent}\r\n`;
        body += `--${boundary}--\r\n`;

        const uploadRes = await fetch(`${API_URL}/documents`, {
            method: 'POST',
            headers: {
                ...authHeader,
                'Content-Type': `multipart/form-data; boundary=${boundary}`
            },
            body: body
        });
        const uploadData = await uploadRes.json();
        if (!uploadRes.ok) throw new Error(`Upload failed: ${JSON.stringify(uploadData)}`);
        console.log('   Success! Document path:', uploadData.file);

        console.log('\n--- ALL TESTS PASSED: BACKEND IS STABLE ---');
    } catch (error) {
        console.error('\n--- VERIFICATION FAILED ---');
        console.error(error.message);
        process.exit(1);
    }
}

runTest();
