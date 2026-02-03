async function registerUser() {
    try {
        const response = await fetch('http://localhost:3001/register-notification', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: 'Admin User',
                phone: '+917577042390'
            })
        });

        const data = await response.json();
        console.log('Registration Response:', data);
    } catch (error) {
        console.error('Error:', error.message);
    }
}

registerUser();
