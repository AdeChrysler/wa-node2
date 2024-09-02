const express = require('express');
const axios = require('axios');
const { Client, LocalAuth } = require('whatsapp-web.js');

const app = express();
app.use(express.json());

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: { headless: true },
});

client.on('qr', qr => {
    console.log('QR RECEIVED', qr);
});

client.on('ready', () => {
    console.log('Client is ready!');
});

client.on('message', async msg => {
    console.log('Message received:', msg.body);

    try {
        // Send the received message to your n8n webhook
        const response = await axios.post('https://your-n8n-webhook-url', {
            from: msg.from,
            body: msg.body,
            id: msg.id._serialized,
        });

        const reply = response.data.reply;
        
        // Send the response from n8n back to the sender on WhatsApp
        if (reply) {
            await client.sendMessage(msg.from, reply);
        }
    } catch (error) {
        console.error('Error processing message:', error);
    }
});

client.initialize();

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
