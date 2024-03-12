const cors = require('cors');
const express = require('express');
const amqp = require('amqplib');
const app = express();
const path = require('path');

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

const PORT = process.env.MODERATOR_PORT || 3100

app.get(['/', 'index.html'], (req, res) => {
    res.sendFile(path.join(__dirname, 'static', 'index.html'))
});

app.get('/style.css', (req, res) => {
    res.sendFile(path.join(__dirname, 'static', 'style.css'));
});

app.get('/script.js', (req, res) => {
    res.sendFile(path.join(__dirname, 'static', 'script.js'));
});

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
    try {
        const conn = await amqp.connect(process.env.RABBITMQ_IP);
        console.log(`Connected to RabbitMQ`);

        const channel = await conn.createChannel();
        // Ensure the queue exists and is durable as per your setup
        await channel.assertQueue('SUBMITTED_JOKES', { durable: true });

        // Try to consume a single message from the queue
        const msg = await channel.get('SUBMITTED_JOKES', { noAck: false });

        if (msg) {
            const joke = JSON.parse(msg.content.toString());
            // Acknowledge the message to remove it from the queue
            channel.ack(msg);
            res.json(joke);
        } else {
            // No message was available in the queue
            res.status(404).send({ message: "No jokes available for moderation." });
        }

    } catch (error) {
        console.error(`Failed to connect to RabbitMQ: ${error}`);
        res.status(500).send('Failed to retrieve');
    }
});


// app.get('/mod', async (req, res) => {

//     try 
//     {
//         const conn = await amqp.connect(process.env.RABBITMQ_IP);
//         console.log(`Connected to RabbitMQ`);

//         const channel = await conn.createChannel();
//         await channel.assertQueue('SUBMITTED_JOKES', { durable: false });

//         channel.get('SUBMITTED_JOKES', {}, (err, message) => {
//             if (err) 
//             {
//                 console.error(`Failed to retrieve message from SUBMITTED_JOKES: ${err}`);
//                 res.status(500).send('Failed to retrieve joke');
//                 return;
//             }
//             if (message) 
//             {
//                 const joke = JSON.parse(message.content.toString());
//                 channel.ack(message);
//                 res.json(joke);
//             } 
//             else 
//             {
//                 res.status(404).send({ message: "No jokes available for moderation." });
//             }
//         });
//     } 
//     catch (error) 
//     {
//         console.error(`Failed to connect to RabbitMQ: ${error}`);
//         res.status(500).send('Failed to retrieve');
//     }
// });

app.post('/mod', async (req, res) => {
    const { joke, action } = req.body;
    const queue = 'MODERATED_JOKES';

    // Extract jokeText and type from the joke object
    const { type, jokeText } = joke; // Assuming 'joke' structure matches this

    if (action === 'submit') 
    {
        try 
        {
            const conn = await amqp.connect('amqp://admin:admin@rabbitmq');
            const channel = await conn.createChannel();
            await channel.assertQueue(queue, { durable: true });

            // Construct a new object with the extracted values if necessary
            const moderatedJoke = { type, jokeText }; // Adjusted to send structured joke

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