async function testChat() {
    const API_URL = 'http://127.0.0.1:3000/api';
    console.log('--- TESTING CHAT ONLY ---');

    // 1. Register
    const regRes = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            name: 'Chat Tester',
            email: `chat_${Date.now()}@test.com`,
            password: 'password123',
            role: 'Investor'
        })
    });
    const regData = await regRes.json();
    const token = regData.token;
    const userId = regData.user.id;
    console.log('Registered User:', userId);

    const authHeader = { 'Authorization': `Bearer ${token}` };

    // 2. Start Interaction
    const intRes = await fetch(`${API_URL}/interactions`, {
        method: 'POST',
        headers: { ...authHeader, 'Content-Type': 'application/json' },
        body: JSON.stringify({
            receiver_id: userId,
            project_name: 'Chat Test Project',
            type: 'Propose Project'
        })
    });
    const intData = await intRes.json();
    const intId = intData.id;
    console.log('Started Interaction:', intId);

    // 3. Send Message
    console.log('Sending message to /api/messages ...');
    const msgRes = await fetch(`${API_URL}/messages`, {
        method: 'POST',
        headers: { ...authHeader, 'Content-Type': 'application/json' },
        body: JSON.stringify({
            interaction_id: intId,
            text: 'Hello, testing persistence!'
        })
    });

    const contentType = msgRes.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
        const msgData = await msgRes.json();
        console.log('Message Success! ID:', msgData.id);
    } else {
        const text = await msgRes.text();
        console.log('Message Failed (Non-JSON)! Status:', msgRes.status);
        console.log('Response Content:', text.slice(0, 500));
    }
}

testChat();
