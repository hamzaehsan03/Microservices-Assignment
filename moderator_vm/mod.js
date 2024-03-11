const cors = require('cors');
const express = require('express');
const amqp = require('amqplib');
const app = express();
const path = require('path');

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

const PORT = process.env.MODERATOR_PORT || 3100

app.get('/types', async (req, res) => {

    try
    {
        const response = await fetch(process.env.JOKES_API_PRIVATE_IP);
        const data = await response.json();
        res.json(data);
    }
    catch(error)
    {
        console.error(`Failed to fetch types: ${error}`);
        res.status(500).send(`Failed to fetch types`);
    }

})

app.get('/mod', async (req, res) => {

    try 
    {
        const conn = await amqp.connect(process.env.RABBITMQ_SUBMISSION_IP);
        console.log(`Connected to RabbitMQ`);

        const channel = await conn.createChannel();
        await channel.assertQueue('SUBMITTED_JOKES', { durable: true });

        channel.get('SUBMITTED_JOKES', {}, (err, message) => {
            if (err) 
            {
                console.error(`Failed to retrieve message from SUBMITTED_JOKES: ${err}`);
                res.status(500).send('Failed to retrieve joke');
                return;
            }
            if (message) 
            {
                const joke = JSON.parse(message.content.toString());
                channel.ack(message);
                res.json(joke);
            } 
            else 
            {
                // No message was available at the time of the request
                res.status(404).send({ message: "No jokes available for moderation." });
            }
        });
    } 
    catch (error) 
    {
        console.error(`Failed to connect to RabbitMQ: ${error}`);
        res.status(500).send('Failed to retrieve');
    }
});


app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`)
});