require ('dotenv');
const ampq = require('amqplib');
const mysql = require('mysql2');

const queue = 'jokesQueue';


async function connectToDatabase(){

    return mysql.createConnection({

        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_DATABASE
    });
}

// Function to consume messages