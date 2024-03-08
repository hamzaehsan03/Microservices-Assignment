const cors = require('cors');
const amqp = require('amqplib');
const mysql = require('mysql2');
const express = require('express');
const app = express();

app.use(cors());
const queue = 'SUBMITTED_JOKES';

async function connectToDatabase() {
    const db = mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.MYSQL_USER || 'hamzaehsan',
        password: process.env.MYSQL_PASSWORD || 'admin',
        database: process.env.MYSQL_DATABASE || 'jokes_service'
    });

    return db.promise();
}

async function getTypeID(typeName) {
    const db = await connectToDatabase();
    // Assuming `type_name` is the column in your `joke_types` table
    const [rows] = await db.execute('SELECT id FROM joke_types WHERE type_name = ?', [typeName]);
    if (rows.length > 0) {
        return rows[0].id; // Assuming the first row contains the desired ID
    } else {
        // Handle the case where the type is not found, maybe insert a new type or use a default
        console.error('Joke type not found:', typeName);
        return null; // or handle differently
    }
}

async function consumeMessage() {
    try {
        const conn = await amqp.connect('amqp://admin:admin@10.0.0.6');
        const channel = await conn.createChannel();

        await channel.assertQueue(queue, { durable: false });
        console.log(`Waiting for messages in ${queue}.`);

        channel.consume(queue, async (message) => {
            if (message !== null) {
                console.log(`Received ${message.content.toString()}`);
                const { type, jokeText } = JSON.parse(message.content.toString());

                const typeId = await getTypeID(type); // Get the type_id based on the type name
                if (!typeId) {
                    console.error('Failed to find type ID for:', type);
                    channel.nack(message); // Negative acknowledgment in case of error
                    return;
                }

                const db = await connectToDatabase();
                await db.execute(
                    'INSERT INTO jokes(type_id, joke_text) VALUES (?, ?)',
                    [typeId, jokeText]
                );

                console.log('Joke written to database');
                channel.ack(message); // Acknowledge the message
            }
        });
    } catch (error) {
        console.error('Failed to start the message consumer:', error);
    }
}

consumeMessage().catch(console.error);
