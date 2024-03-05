const express = require ('express');
const app = express();
const path = require('path')

const PORT = process.env.SUBMIT_PORT || 3200

app.get(['/', 'index.html'], (req, res) => {
    res.sendFile(path.join(__dirname, 'static', 'index.html'))
});

app.get('/style.css', (req, res) => {
    res.sendFile(path.join(__dirname, 'static', 'style.css'));
});

app.get('/script.js', (req, res) => {
    res.sendFile(path.join(__dirname, 'static', 'script.js'));
});

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`)
});