async function submitTestReport() {
    try {
        const testReport = {
            basinId: 'jalukbari',
            issueType: 'Waterlogging',
            description: 'Test report for WhatsApp notification verification',
            photoData: null,
            location: { lat: 26.1445, lng: 91.6616, accuracy: 50 },
            timestamp: new Date().toISOString(),
            userName: 'Test User'
        };

        const response = await fetch('http://127.0.0.1:3001/reports', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(testReport)
        });

        if (!response.ok) {
            const text = await response.text();
            console.error('Error Response:', text);
            return;
        }

        const data = await response.json();
        console.log('Report submitted successfully!');
        console.log('Report ID:', data.id);
        console.log('Check your WhatsApp for the notification!');
    } catch (error) {
        console.error('Error:', error.message);
    }
}

submitTestReport();
