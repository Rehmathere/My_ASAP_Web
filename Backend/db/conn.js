// db.js

const mongoose = require('mongoose');

//const dbURI = 'mongodb+srv://ahmedadeel164722:20020Chand@cluster0.nx4zcye.mongodb.net/assoonaspossible?retryWrites=true&w=majority'; 
const dbURI = 'mongodb://ahmedadeel164722:20020Chand@ac-mc3fsgz-shard-00-00.nx4zcye.mongodb.net:27017,ac-mc3fsgz-shard-00-01.nx4zcye.mongodb.net:27017,ac-mc3fsgz-shard-00-02.nx4zcye.mongodb.net:27017/assoonaspossible?ssl=true&replicaSet=atlas-91f6qu-shard-0&authSource=admin&retryWrites=true&w=majority'; 
// const dbURI = 'mongodb+srv://eservices908:u0jn1XgFubvsPyIB@asap-cluster.mlctjlz.mongodb.net/?retryWrites=true&w=majority&appName=ASAP-Cluster'; 
// const dbURI = 'mongodb+srv://eservices908:u0jn1XgFubvsPyIB@asap-cluster.mlctjlz.mongodb.net/ASAP?retryWrites=true&w=majority&appName=ASAP-Cluster';
mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true });

const dbConnection = mongoose.connection;

dbConnection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});

dbConnection.once('open', () => {
  console.log('Connected to MongoDB');
});

module.exports = dbConnection;