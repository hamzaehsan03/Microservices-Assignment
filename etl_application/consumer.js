/* 
DEPRECATED

THIS SCRIPT WAS INITIALLY CREATED TO CHECK WHETHER MESSAGES COULD BE CONSUMED ON THE QUEUE
FUNCTIONALITY HAS BEEN MIGRATED TO index.js
*/


const amqp = require('amqplib');

const queue = 'jokesQueue'; 
async function startConsumer() {
  try 
  {
    const conn = await amqp.connect('amqp://localhost'); 
    const channel = await conn.createChannel();

    await channel.assertQueue(queue, {
      durable: false
    });

    console.log(`[*] Waiting for messages in ${queue}.`);

    channel.consume(queue, (msg) => {
      if (msg !== null) 
      {
        console.log(`[x] Received: ${msg.content.toString()}`);
        // Acknowledge the message
        channel.ack(msg);
      }
    },

    {
      noAck: false
    });
  }
   catch (error) 
  {
    console.error('Error in consumer:', error);
  }
}

startConsumer();
