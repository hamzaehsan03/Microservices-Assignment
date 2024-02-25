const express = require ('express');
const app = express();
const mysql = require('mysql2')
const PORT = 3000;

// let conStr = {
//     host: process.env.DB_HOST,
//     user: process.env.DB_USER,
//     password: process.env.DB_PASSWORD,
//     database: process.env.DB_DATABASE
// }

// const db = mysql.createConnection(conStr);

// db.connect((err) => {
//     if (err) throw err;
//     console.log(`Connected to database: ${conStr.database}`);
// })

app.get('/', (req, res) => {
    res.send('Hello world');
});

app.listen(PORT, () => {
    console.log(`Joke service listening on port ${PORT}`);
})

// Example endpoint to fetch types
app.get('/type', (req, res) => {

    console.log(`Fetching Jokes succeeded`);
    // Fetch jokes from database

    res.json(["general", "test"]); // example response
})

// Example endpoint to fetch jokes
app.get('/joke', (req, res) => {

    const {type, count} = req.query;
    console.log(`Fetching ${count || 1} joke(s) of type '${type || "any"}' succeeded`);
    // Scaffold code
    // Write the actual code to fetch a joke by type and count

    res.json({
        jokes: [
            { id: 1, type: type || "any", joke: "My therapist says I have a preoccupation with vengeance. We’ll see about that." }
        ]
    });
});

