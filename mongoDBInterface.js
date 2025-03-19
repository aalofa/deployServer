'use strict';
import { MongoClient, ServerApiVersion } from 'mongodb';
import dotenv from 'dotenv';
dotenv.config();

const dbConnectionUri = `mongodb+srv://${process.env.MONGO_USERAME}:${process.env.MONGO_PASSWORD}@meteoapp.2ruzb.mongodb.net/?retryWrites=true&w=majority&appName=MeteoApp`;
const dbName = 'wordSurgery';
const collectionName = 'leaderboard';
const leaderboardEntryLimit = 100;

const client = new MongoClient(dbConnectionUri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    },
});

class MongoDBClient {
    static instance;

    constructor() {
        if (MongoDBClient.instance) {
            return MongoDBClient.instance;
        }
        MongoDBClient.instance = this;
    }

    /**
     * Returns the singleton instance of MongoDBClient.
     * @returns {MongoDBClient} The singleton instance of MongoDBClient.
     */
    static getInstance() {
        if (!MongoDBClient.instance) {
            MongoDBClient.instance = new MongoDBClient();
        }
        return MongoDBClient.instance;
    }

    async connect(){
        this.client = client;
        await this.client.connect().then(() => {
            console.log('MongoDB connected!');
        }).catch(err => {
            console.error(`MongoDB connection error : ${err}`);
        });
        const db = this.client.db(dbName);
        db.collection(collectionName);
    }

    async closeConnection() {
        if (this.client) {
            await this.client.close();
            console.log('MongoDB was connection closed!');
        }
    }

    async getLeaderboard(){
        const db = this.client.db(dbName);
        const collection = db.collection(collectionName);
        const data = await collection.find().toArray();
        return data;
    }

    async setLeaderboard(leaderboard) {
        await this.client.db(dbName).collection(collectionName).deleteMany({});
        await this.client.db(dbName).collection(collectionName).insertMany(leaderboard);
    }

    async addLeaderboardEntry(entry) {
        const collection = this.client.db(dbName).collection(collectionName);
        await collection.insertOne(entry);

        const count = await collection.countDocuments();
        if (count > leaderboardEntryLimit) {
            const lowestEntry = await collection.find().sort({ points: 1,timeELapsed: -1}).limit(1).toArray();
            console.log("Mongo : Added new entry.")
            if (lowestEntry.length > 0) {
                await collection.deleteOne({ _id: lowestEntry[0]._id });
                console.log("Mongo : Deleted lowest score")
            }
        }
    }
}

export default MongoDBClient;