const twilio = require('twilio');
require('dotenv').config();

const client = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
);

async function sendWhatsAppNotification(phoneNumber, message) {
    try {
        const to = phoneNumber.startsWith('whatsapp:')
            ? phoneNumber
            : `whatsapp:${phoneNumber}`;
        
        const from = `whatsapp:${process.env.TWILIO_PHONE_NUMBER}`;

        const msg = await client.messages.create({
            body: message,
            from: from,
            to: to
        });

        console.log(`WhatsApp Notification sent to ${phoneNumber}: ${msg.sid}`);
        return msg.sid;
    } catch (error) {
        console.error(`Failed to send WhatsApp to ${phoneNumber}:`, error.message);
        throw error;
    }
}

async function broadcastNotifications(phoneNumbers, message) {
    const promises = phoneNumbers.map(phone => 
        sendWhatsAppNotification(phone, message)
    );
    
    try {
        await Promise.all(promises);
        console.log(`Successfully sent notifications to ${phoneNumbers.length} recipients`);
    } catch (error) {
        console.error('Some notifications failed:', error.message);
    }
}

module.exports = {
    sendWhatsAppNotification,
    broadcastNotifications
};
