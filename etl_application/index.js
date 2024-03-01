require('dotenv').config();
const amqp = require('amqplib');
const mysql = require('mysql2');

const queue = 'jokesQueue';

async function connectToDatabase() {
    const db = mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_DATABASE
    });

    return db.promise();
}

async function connectToRabbitMQ(retryCount = 0) {
    try 
    {
        const conn = await amqp.connect('amqp://rabbitmq');
        console.log('Connected to RabbitMQ.');
        return conn;
    } 
    catch (err) 
    {
        console.error(`Error connecting to RabbitMQ: ${err}`);
        if (retryCount < 5) 
        {
            console.log(`Retrying to connect to RabbitMQ... Attempt ${retryCount + 1}`);
            await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds before retrying
            return connectToRabbitMQ(retryCount + 1);
        } 
        else 
        {
            console.error('Failed to connect to RabbitMQ after retries. Exiting.');
            process.exit(1);
        }
    }
}

async function consumeMessage() {
    try 
    {
        const conn = await connectToRabbitMQ();
        const channel = await conn.createChannel();

        await channel.assertQueue(queue, { durable: false });
        console.log(`Waiting for messages in ${queue}.`);

        channel.consume(queue, async (message) => {
            if (message !== null) 
            {
                console.log(`Received ${message.content.toString()}`);
                const joke = JSON.parse(message.content.toString());

                const db = await connectToDatabase();
                await db.execute(
                    'INSERT INTO jokes(type_id, joke_text) VALUES (?, ?)',
                    [joke.type_id, joke.joke_text]
                );

                console.log('Joke written to database');
                channel.ack(message);
            }
        });
    } 
    catch (error) 
    {
        console.error('Failed to start the message consumer:', error);
    }
}

consumeMessage().catch(console.error);
