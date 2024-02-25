const express = require ('express');
const app = express();
const PORT = 3000;


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

