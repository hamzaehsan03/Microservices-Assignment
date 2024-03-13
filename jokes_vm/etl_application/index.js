const cors = require('cors');
const amqp = require('amqplib');
const mysql = require('mysql2');
const express = require('express');
const app = express();

app.use(cors());
const queue = 'MODERATED_JOKES';

async function connectToDatabase() {
    const db = mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.MYSQL_USER || 'hamzaehsan',
        password: process.env.MYSQL_PASSWORD || 'admin',
        database: process.env.MYSQL_DATABASE || 'jokes_service'
    });

    return db.promise();
}

// Function to get the Type ID from the database
async function getTypeID(typeName) {
    const db = await connectToDatabase();

    const [rows] = await db.execute('SELECT id FROM joke_types WHERE type_name = ?', [typeName]);
    if (rows.length > 0) 
    {
        return rows[0].id;
    } 
    else 
    {
        // Log an error if the type isn't found, return null
        console.error('Joke type not found:', typeName);

        // Could potentially give it a default type
        return null;
    }
}

// Function to consume a message from the MODERATED_JOKES queue
async function consumeMessage() {
    try 
    {
        // Attempt to establish a connection to the MODERATED_JOKES queue and create a channel
        const conn = await amqp.connect(process.env.RABBITMQ_MODERATE_IP);
        const channel = await conn.createChannel();

        // Assert the queue exists with the durability set to true to ensure that the queue survives restarts
        await channel.assertQueue(queue, { durable: true });
        console.log(`Waiting for messages in ${queue}.`);

        // Set up a consumer
        channel.consume(queue, async (message) => {

            // Check if the message isn't null
            if (message !== null) 
            {
                // Parse the message into an JSON object
                console.log(`Received ${message.content.toString()}`);
                const { type, jokeText } = JSON.parse(message.content.toString());

                // Retrive the Type ID
                const typeId = await getTypeID(type); 

                // If no Type ID is found, return a negative acknowledgement and an error
                if (!typeId) 
                {
                    console.error('Failed to find type ID for:', type);
                    channel.nack(message); 
                    return;
                }

                // Connect to the database and insert an SQL statement into the jokes table with the data recieved
                const db = await connectToDatabase();
                await db.execute(
                    'INSERT INTO jokes(type_id, joke_text) VALUES (?, ?)',
                    [typeId, jokeText]
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
