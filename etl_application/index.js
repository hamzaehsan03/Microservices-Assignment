require ('dotenv');
const ampq = require('amqplib');
const mysql = require('mysql2');

const queue = 'jokesQueue';

let conn;
let channel;


async function connectToDatabase(){

    return mysql.createConnection({

        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_DATABASE
    });
}

// Function to consume messages

async function consumeMessage()
{
    const conn = await ampq.connect('ampq://rabbitmq');
    const channel = await conn.createChannel();

    await channel.assertQueue(queue, {durable: false});
    console.log(`Waiting for messages in ${queue}.`);

    channel.consume(queue, async (message) => {
        if (message !== null)
        {
            console.log(`Recieved ${message.content.toString()}`);
            const joke = JSON.parse(message.content.toString());

            const db = await connectToDatabase();
            await db.execute(
                'INSERT INTO jokes(type_id, joke_text) VALUES (?, ?)',
                [joke.type_id, joke.joke_text]
            );

            console.log(`Joke written to database`);
            channel.ack(message);
        }


    })
}

consumeMessages().catch(console.warn);