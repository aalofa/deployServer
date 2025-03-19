// Inspired from : https://node-js.fr/server/
const express = require('express');
const MongoDBClient = require('./mongoDBInterface.js').default;
const mongo = MongoDBClient.getInstance();
const cors = require('cors');
const app = express();
const port = 3000;

app.use(cors({ origin: true }));
app.use(express.json());

(async () => {
    try {
        await mongo.connect();
        console.log('Connected to MongoDB');
    } catch (error) {
        console.error('Failed to connect to MongoDB:', error);
        process.exit(1);
    }
})();

app.get('/', async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(203).send('Salut, bienvenue sur le serveur de word surgery!');
});

app.get('/leaderboard', async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(200).send(await mongo.getLeaderboard());
    console.log("Leaderboard was succesfully fetched.")
});

app.post('/newEntry', async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    console.log('Received new entry :', req.body);

    if (typeof req.body !== 'object' || req.body === null) {
        return res.status(400).send({ message: 'Invalid JSON object' });
    }

    const { userId, timestamp, points, timeElapsed } = req.body;

    if (!userId || !timestamp || !points || !timeElapsed) {
        return res.status(418).send({ message: 'Missing required fields' });
    }

    await mongo.addLeaderboardEntry(req.body);
    res.status(202).send({ message: 'New entry added successfully', entry: req.body });
});

app.listen(port, '0.0.0.0', () => {
    console.log(`Serveur démarré sur http://localhost:${port}`);
});

process.on('SIGINT', async () => {
    console.log('Closing MongoDB connection...');
    await mongo.closeConnection();
    process.exit(0);
});