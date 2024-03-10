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

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`)
});