// Inspired from : https://node-js.fr/server/
const express = require('express');
const MongoDBClient = require('./mongoDBInterface.js').default;
const mongo = MongoDBClient.getInstance();
const Util = require('./util.js');
const u = new Util();
const cors = require('cors');
const app = express();
const port = 3000;

app.use(cors({ origin: true }));
app.use(express.json());

app.get('/', async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(203).send('Salut, bienvenue sur le serveur de word surgery!');
});

app.get('/leaderboard', async (req, res) => {
    await mongo.connect();
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(200).send(await mongo.getLeaderboard());
    console.log("Leaderboard was succesfully fetched.")
    await mongo.closeConnection();
});

app.post('/newEntry', async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    console.log('Received request body:', req.body); // Add logging to debug the request payload

    if (typeof req.body !== 'object' || req.body === null) {
        return res.status(400).send({ message: 'Invalid JSON object' });
    }

    const { userId, timestamp, points, timeElapsed } = req.body;

    if (!userId || !timestamp || !points || !timeElapsed) {
        return res.status(418).send({ message: 'Missing required fields' });
    }

    await mongo.connect();
    await mongo.addLeaderboardEntry(req.body);
    res.status(202).send({ message: 'New entry added successfully', entry: req.body });
    await mongo.closeConnection();
});

app.listen(port, '0.0.0.0', () => {
    console.log(`Serveur démarré sur http://localhost:${port} or http://${u.getLocalIp().en0}:${port}`);
});