const express = require ('express');
const cors = require('cors');
const app = express();
const path = require('path');
const mysql = require('mysql2');

const PORT = process.env.JOKE_PORT || 3000

app.use(cors()); // Allow for the submit microservice to access /type endpoint

let db;

function connectToDatabase(retryCount = 0) 
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
        //    if (retryCount < 5) {

        //        setTimeout(() => connectToDatabase(retryCount + 1), 5000); // Retry after 5 seconds
        //    } 
        //    else 
        //    {
        //        console.error('Failed to connect to the database after retries. Exiting.');
                process.exit(1); // Exit the application if unable to connect
        //    }
        } 
        else 
        {
            console.log('Connected to database.');
            startServer(); // Start the server once the database connection is established
        }
    });
}

connectToDatabase();

app.get(['/', '/index.html'], (req, res) => {
    res.sendFile(path.join(__dirname, 'static', 'index.html'));
});

// I'm not really sure why this is required
// I think the express.static middleware wasn't correctly configured to serve the files from the directory, so explicit routes fixes that
// I reformatted a lot of the folders and names when creating docker containers, so it could be an issue with caching, though I still don't like this solution
// I'll fix this soon, probably using path.resolve, this works well as a temporary patch now though I guess

app.get('/style.css', (req, res) => {
    res.sendFile(path.join(__dirname, 'static', 'style.css'));
});

app.get('/script.js', (req, res) => {
    res.sendFile(path.join(__dirname, 'static', 'script.js'));
});


app.get('/type', async(req, res) => {

    try 
    {
        // Log the db variable to see if it's defined
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

async function getJokes(type = 'any', count = 1) {
    let sql = '';
    const params = [];

    // Adjust the query to join jokes with their types
    if (type === 'any') 
    {
        // If 'any' is selected, simply return random jokes without filtering by type
        sql = `SELECT jokes.* FROM jokes ORDER BY RAND() LIMIT ?`;
        params.push(parseInt(count, 10) || 1);
    } 
    else 
    {
        // Join with the joke_types table to filter by type_name
        sql = `SELECT jokes.* FROM jokes JOIN joke_types ON jokes.type_id = joke_types.id WHERE joke_types.type_name = ? ORDER BY RAND() LIMIT ?`;
        params.push(type, parseInt(count, 10) || 1);
    }

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

function startServer() 
{
    app.listen(PORT, () => {
        console.log(`Server listening on port ${PORT}`);
    });
}