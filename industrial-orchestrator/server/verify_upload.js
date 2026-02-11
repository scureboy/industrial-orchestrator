async function testUpload() {
    const API_URL = 'http://127.0.0.1:3000/api';
    console.log('--- TESTING DOCUMENT UPLOAD ONLY ---');

    // 1. Get Token (using the user created previously if possible, or new one)
    const regRes = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            name: 'Upload Tester',
            email: `upload_${Date.now()}@test.com`,
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
            project_name: 'Upload Test Project',
            type: 'Propose Project'
        })
    });
    const intData = await intRes.json();
    const intId = intData.id;
    console.log('Started Interaction:', intId);

    // 3. Upload Document
    console.log('Uploading document ...');
    const boundary = '----Boundary' + Math.random().toString(16);
    const fileName = 'test-upload.txt';
    const fileContent = 'Consistency Check Content';

    let body = '';
    body += `--${boundary}\r\n`;
    body += `Content-Disposition: form-data; name="interaction_id"\r\n\r\n${intId}\r\n`;
    body += `--${boundary}\r\n`;
    body += `Content-Disposition: form-data; name="name"\r\n\r\n${fileName}\r\n`;
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

    const contentType = uploadRes.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
        const uploadData = await uploadRes.json();
        if (uploadRes.ok) {
            console.log('Document Success! Path:', uploadData.file);
        } else {
            console.log('Document Failed (JSON Error):', JSON.stringify(uploadData));
        }
    } else {
        const text = await uploadRes.text();
        console.log('Document Failed (Non-JSON)! Status:', uploadRes.status);
        console.log('Response Content:', text.slice(0, 500));
    }
}

testUpload();
