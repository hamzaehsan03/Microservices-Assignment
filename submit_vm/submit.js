const cors = require('cors');
const express = require ('express');
const amqp = require('amqplib');
const app = express();
const path = require('path')

const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUI = require('swagger-ui-express');

app.use(express.json());
app.use(express.static('public'));
app.use(cors());

const PORT = process.env.SUBMIT_PORT || 3200

const options = {
    definition: {

        openapi: '3.0.0',
        info: {
            title: 'Submit Service',
            version: '1.0.0',
            description: 'Documentation for Submit Service',
        },
    },
    apis: ['submit.js']
};

const swaggerDocs = swaggerJsDoc(options);
app.use('/docs', swaggerUI.serve, swaggerUI.setup(swaggerDocs))

app.use(express.static(path.join(__dirname, 'static')));

/**
 * @swagger
 * /types:
 *   get:
 *     summary: Retrieves a list of joke types
 *     description: Fetches a list of available joke types from the Jokes API.
 *     responses:
 *       200:
 *         description: A JSON array of joke types
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     example: 1
 *                     description: The unique identifier of the joke type.
 *                   type_name:
 *                     type: string
 *                     example: 'general'
 *                     description: The name of the joke type.
 *       500:
 *         description: Server error
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: 'failed to fetch types'
 */

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
        res.status(500).send('failed to fetch types');
    }
    
})

/**
 * @swagger
 * /sub:
 *   post:
 *     summary: Submits a new joke
 *     description: Submit a new joke to the SUBMITTED_JOKES queue
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               type:
 *                 type: string
 *                 description: Type of the joke
 *               jokeText:
 *                 type: string
 *                 description: The content of the joke
 *     responses:
 *       200:
 *         description: Joke submitted successfully
 *       500:
 *         description: Failed to submit joke
 */

app.post('/sub', async (req, res) => {
    const {type, jokeText} = req.body;

    const queue = 'SUBMITTED_JOKES';
    try 
    {
        const conn = await amqp.connect(process.env.RABBITMQ_IP);
        console.log(`Connected to RabbitMQ`);
        
        const channel = await conn.createChannel();
        await channel.assertQueue(queue, {durable: true});

        const message = {
            type: type,
            jokeText: jokeText
        };

        channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)));
        console.log(`Message sent to ${queue}: ${JSON.stringify(message)}`);  

        res.status(200).send('Joke submitted');
    } 
    catch (error)
    {
        console.error('Failed to send message to RabbitMQ:', error);
        res.status(500).send('Failed to submit joke');
    }
});

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`)
});