const express = require ('express');

const app = express();
const mysql = require('mysql2')
const PORT = 3000;

// I'm not too sure why this doesn't work
// Debug later
require ('dotenv').config();
app.use(express.static('static'));
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

app.get('/joke', async (req, res) => {
    const { type, count } = req.query;
    try 
    {
        const jokes = await getJokes(type, count);
        res.json(jokes);
    } 
    catch (err) 
    {
        res.status(500).send(err.message);
    }
});

async function getJokes(type = 'any', count = 1) {
    let sql = '';
    const params = [];

    // Adjust the query to join jokes with their types
    if (type === 'any') {
        // If 'any' is selected, simply return random jokes without filtering by type
        sql = `SELECT jokes.* FROM jokes ORDER BY RAND() LIMIT ?`;
        params.push(parseInt(count, 10) || 1);
    } else {
        // Join with the joke_types table to filter by type_name
        sql = `SELECT jokes.* FROM jokes JOIN joke_types ON jokes.type_id = joke_types.id WHERE joke_types.type_name = ? ORDER BY RAND() LIMIT ?`;
        params.push(type, parseInt(count, 10) || 1);
    }

    return new Promise((resolve, reject) => {
        db.query(sql, params, (err, results) => {
            if (err) {
                reject(`Database error: ${err.message}`);
            } else {
                resolve(results);
            }
        });
    });
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