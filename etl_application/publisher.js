/* 
DEPRECATED

THIS SCRIPT WAS INITIALLY CREATED TO CHECK WHETHER MESSAGES COULD BE PUBLISHED TO THE QUEUE
FUNCTIONALITY HAS BEEN MIGRATED TO THE SUBMISSION MICROSERVICE
*/


const amqp = require("amqplib");

const queue = 'jokesQueue';
const message = {
    type_id: 1,
    joke_text: "Why should you never play poker at the zoo? Too many cheetahs."
};

async function publishMessage()
{
    // A M Q P!! amqp NOT ampq!!!!
    const connection = await amqp.connect('amqp://localhost');
    const channel = await connection.createChannel();
    await channel.assertQueue(queue, {durable: false});

    
  channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)));
  console.log(`Message sent to ${queue}: ${JSON.stringify(message)}`);

  setTimeout(() => {
    connection.close();
    process.exit(0);
  }, 500);
}


publishMessage().catch(console.error);