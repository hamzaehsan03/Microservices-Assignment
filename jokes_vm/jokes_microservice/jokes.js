const cors = require('cors');
const express = require ('express');
const app = express();
const path = require('path');
const mysql = require('mysql2');

const PORT = process.env.JOKE_PORT || 3000

app.use(cors()); // Allow for the submit microservice to access /type endpoint

let db;

// Function to connect to the database
function connectToDatabase() 
{
    db = mysql.createConnection ({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.MYSQL_USER || 'hamzaehsan',
        password: process.env.MYSQL_PASSWORD || 'admin',
        database: process.env.MYSQL_DATABASE || 'jokes_service'
    });

    db.connect(err => {
        if (err) 
        {
            console.error(`Error connecting to the database: ${err}`);
            process.exit(1); 
        } 
        else 
        {
            console.log('Connected to database.');
            startServer(); 
        }
    });
}

connectToDatabase();

// Serve static files from the static directory
app.use(express.static(path.join(__dirname, 'static')));

// GET endpoint for fetching types
app.get('/type', async(req, res) => {

    try 
    {
        console.log('DB connection in /type endpoint:', db);
        
        const result = await getTypes();
        res.send(result);
    } 
    catch(err) 
    {
        console.error('Error in /type endpoint:', err);
        res.status(500).send(err);
    }

})

// GET endpoint for fetching jokes 
app.get('/joke', async (req, res) => {
    
    try 
    {
        // Log the db variable to see if it's defined
        console.log('DB connection in /joke endpoint:', db);
        const jokes = await getJokes(req.query.type, req.query.count);
        res.json(jokes);
    } 
    catch (err) 
    {
        console.error('Error in /joke endpoint:', err);
        res.status(500).send(err.message);
    }

});

// Function to get jokes from the database
async function getJokes(type = 'any', count = 1) {

    // Build an SQL query depending on the options
    let sql = '';
    const params = [];

    // Select a random joke if no specific type is selected
    if (type === 'any') 
    {
        sql = `SELECT jokes.* FROM jokes ORDER BY RAND() LIMIT ?`;
        params.push(parseInt(count, 10) || 1);
    } 

    // Filter the joke by the type selected
    else 
    {
        sql = `SELECT jokes.* FROM jokes JOIN joke_types ON jokes.type_id = joke_types.id WHERE joke_types.type_name = ? ORDER BY RAND() LIMIT ?`;
        params.push(type, parseInt(count, 10) || 1);
    }

    // Return a promise that resolves with the query results or rejects with an error
    return new Promise((resolve, reject) => {
        db.query(sql, params, (err, results) => {
            if (err) 
            {
                reject(`Database error: ${err.message}`);
            } 
            else 
            {
                resolve(results);
            }
        });
    });
}

// Fetch all the types from the database
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

// Start the server
function startServer() 
{
    app.listen(PORT, () => {
        console.log(`Server listening on port ${PORT}`);
    });
}