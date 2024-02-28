const express = require ('express');
const app = express();
const path = require('path');
const mysql = require('mysql2');
const PORT = 3000;

require ('dotenv').config();

let conStr = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE
};

app.use(express.static('static'));

const db = mysql.createConnection(conStr);

db.connect((err) => {
    if (err) {
        console.error('Error connecting to the database: ', err);
        return;
    }
    console.log(`Connected to database: ${conStr.database}`);
});

app.get(['/', '/index.html'], (req, res) => {
    res.sendFile(path.join(__dirname, 'static', 'index.html'));
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