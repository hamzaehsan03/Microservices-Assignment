const cors = require('cors');
const express = require('express');
const amqp = require('amqplib');
const app = express();
const path = require('path');

app.use(cors());
app.use(express.json());

const PORT = process.env.MODERATOR_PORT || 3100

// Serve static files from 'static' directory
app.use(express.static(path.join(__dirname, 'static')));

// GET endpoint to fetch joke types
app.get('/types', async (req, res) => {

    try
    {
        // Try to fetch jokes from the jokes API
        // Parse the response as JSON and send it
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

// GET endpoint to moderate a joke
app.get('/mod', async (req, res) => {
    try 
    {
        // Connect to RabbitMQ and try to get messages from the SUBMITTED_JOKES queue
        const conn = await amqp.connect(process.env.RABBITMQ_IP);
        console.log(`Connected to RabbitMQ`);

        const channel = await conn.createChannel();

        await channel.assertQueue('SUBMITTED_JOKES', { durable: true });
        const msg = await channel.get('SUBMITTED_JOKES', { noAck: false });

        if (msg) 
        {
            const joke = JSON.parse(msg.content.toString());
            // Acknowledge the message to remove it from the queue
            channel.ack(msg);
            res.json(joke);
        } 
        else 
        {
            // No message was available in the queue
            res.status(404).send({ message: "No jokes available for moderation." });
        }

    } 
    catch (error) 
    {
        console.error(`Failed to connect to RabbitMQ: ${error}`);
        res.status(500).send('Failed to retrieve');
    }
});

// POST endpoint to submit or discard moderated jokes
app.post('/mod', async (req, res) => {

    // Extract the joke object and action from the request body
    const { joke, action } = req.body;
    const queue = 'MODERATED_JOKES';

    // Single out type and jokeText from the joke object
    const { type, jokeText } = joke; 

    // If the request was to submit the joke
    if (action === 'submit') 
    {
        try 
        {
            // Connect to RabbitMQ and create a a channel
            // Construct a new object with the values submitted and send the structured joke to the MODERATED_JOKES queue 
            const conn = await amqp.connect('amqp://admin:admin@rabbitmq');
            const channel = await conn.createChannel();
            await channel.assertQueue(queue, { durable: true });

            const moderatedJoke = { type, jokeText };

            channel.sendToQueue(queue, Buffer.from(JSON.stringify(moderatedJoke)));
            res.status(200).send('Joke submitted to MODERATED_JOKES');
        } 
        catch (error) 
        {
            console.error(`Failed to submit joke to MODERATED_JOKES: ${error}`);
            res.status(500).send('Failed to process moderated joke');
        }
    } 
    else if (action === 'discard') 
    {
        res.status(200).send('Joke discarded');
    } 
    else 
    {
        res.status(400).send('Invalid Action');
    }
});



app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`)
});