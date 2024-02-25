const express = require ('express');
const app = express();
const mysql = require('mysql2')
const PORT = 3000;

// I'm not too sure why this doesn't work
// Debug later
require ('dotenv').config();

// const DB_HOST = process.env.HOST;
// const DB_USER = process.env.DB_USER;
// const DB_PASSWORD = process.env.DB_PASSWORD;
// const DB_DATABASE = process.env.DB_DATABASE;

// let conStr = {
//     host: DB_HOST,
//     user: DB_USER,
//     password: DB_PASSWORD,
//     database: DB_DATABASE
// };

let conStr = {
    host: 'localhost',
    user: 'root',
    password: 'admin',
    database: 'jokes_service'
};

const db = mysql.createConnection(conStr);

db.connect((err) => {
    if (err) {
        console.error('Error connecting to the database: ', err);
        return;
    }
    console.log(`Connected to database: ${conStr.database}`);
});

app.get('/', (req, res) => {
    res.send('Hello world');
});

app.get('/type', async(req, res) => {
    try
    {
        const result = await getTypes();
        res.send(result);
    }
    catch(err)
    {
        res.status(500).send(err);
    }
})

app.get('/joke', async(req, res) => {
    try
    {
        const result = await getJokes();
        res.send(result);
    }
    catch(err)
    {
        res.status(500).send(err);
    }
})

async function getJokes() {
    const result = new Promise((resolve, reject) => {
        const sql = `select * from jokes`;
        db.query(sql, (err, results) => {
            if (err)
            {
                reject(`Database error: ${err.message}`);
            }
            else
            {
                resolve(results);
            }
        })
    })
    return result;
}

async function getTypes(){
    const result = new Promise((resolve, reject) => {
        const sql = `select * from joke_types`;
        db.query(sql, (err, results) => {
            if (err)
            {
                reject(`Database error: ${err.message}`);
            }
            else
            {
                resolve(results);
            }
        })
    })
    return result;
}

app.listen(PORT, () => {
    console.log(`Joke service listening on port ${PORT}`);
})