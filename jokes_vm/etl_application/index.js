require('dotenv').config();
const amqp = require('amqplib');
const mysql = require('mysql2');

const queue = 'SUBMITTED_JOKES';

async function connectToDatabase() {
    const db = mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_DATABASE
    });

    return db.promise();
}

async function consumeMessage() {
    try 
    {
        // add to env
        const conn = await amqp.connect('amqp://admin:admin@rabbitmq');
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
