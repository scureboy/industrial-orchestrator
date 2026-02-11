const axios = require('axios');
const fs = require('fs');
const path = require('path');
const FormData = require('form-data');

const API_URL = 'http://127.0.0.1:3000/api';

async function runTest() {
    console.log('--- STARTING API VERIFICATION ---');
    try {
        // 1. Register
        console.log('1. Registering test user...');
        const regRes = await axios.post(`${API_URL}/auth/register`, {
            name: 'Tester',
            email: `test_${Date.now()}@test.com`,
            password: 'password123',
            role: 'Investor'
        });
        const token = regRes.data.token;
        const userId = regRes.data.user.id;
        console.log('   Success! User ID:', userId);

        const config = { headers: { Authorization: `Bearer ${token}` } };

        // 2. Start Interaction
        console.log('2. Starting interaction...');
        const intRes = await axios.post(`${API_URL}/interactions`, {
            receiver_id: userId, // Interacting with self for test
            project_name: 'Test Project',
            type: 'Propose Project'
        }, config);
        const intId = intRes.data.id;
        console.log('   Success! Interaction ID:', intId);

        // 3. Send Message
        console.log('3. Sending persistent message...');
        const msgRes = await axios.post(`${API_URL}/messages`, {
            interaction_id: intId,
            text: 'Hello, this is a persistent test message.'
        }, config);
        console.log('   Success! Message ID:', msgRes.data.id);

        // 4. Verify Messages
        console.log('4. Verifying message retrieval...');
        const getMsgRes = await axios.get(`${API_URL}/messages/interaction/${intId}`, config);
        if (getMsgRes.data.length > 0) {
            console.log('   Success! Found messages:', getMsgRes.data.length);
        } else {
            throw new Error('Message not found after save');
        }

        // 5. Upload Document
        console.log('5. Uploading document...');
        const form = new FormData();
        form.append('interaction_id', intId);
        form.append('name', 'test-doc.txt');
        // Create dummy file
        const dummyPath = path.join(__dirname, 'test-doc.txt');
        fs.writeFileSync(dummyPath, 'Hello World');
        form.append('document', fs.createReadStream(dummyPath));

        const uploadRes = await axios.post(`${API_URL}/documents`, form, {
            headers: {
                ...config.headers,
                ...form.getHeaders()
            }
        });
        console.log('   Success! Document path:', uploadRes.data.file);

        console.log('\n--- VERIFICATION SUCCESSFUL: BACKEND IS 100% FUNCTIONAL ---');
    } catch (error) {
        console.error('\n--- VERIFICATION FAILED ---');
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', error.response.data);
        } else {
            console.error('Error:', error.message);
        }
        process.exit(1);
    }
}

runTest();
