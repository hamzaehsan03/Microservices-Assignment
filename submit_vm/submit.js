const express = require ('express');
const amqp = require('amqplib');
const app = express();
const path = require('path')

app.use(express.json());
app.use(express.static('public'));

const PORT = process.env.SUBMIT_PORT || 3200

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
        const result = await getTypes();
        res.send(result);
    }
    catch (err)
    {
        console.error(`Error in fetching /types from API ${err}`);
        res.status(500).send(err);
    }
})


app.post('/sub', async (req, res) => {

    const {type, jokeText} = req.body;

    const queue = 'SUBMITTED_JOKES';
    const conn = await amqp.connect('amqp://rabbitmq')

    console.log(`Connected to RabbitMQ`);
    
    const channel = await createConnection.createChannel();
    await channel.assertQueue(queue, {durable: false});

    channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)));
    console.log(`Message sent to ${queue}: ${JSON.stringify(message)}`);  

})



app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`)
});