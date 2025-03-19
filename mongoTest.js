'use strict'
//usage example 
import MongoDBClient from './mongoDBInterface.js';
const leaderboardPlaceholder = [
    {userId:"test", timestamp: "16 Jan 2024", points: 1, timeElapsed: 30 },
];
let mongo = MongoDBClient.getInstance();
await mongo.connect()
await mongo.setLeaderboard(leaderboardPlaceholder)
//await mongo.addLeaderboardEntry({userId:"test", timestamp: "20 Jan 2024", points: 99, timeElapsed: 30 })
console.log(await mongo.getLeaderboard())
await mongo.closeConnection()