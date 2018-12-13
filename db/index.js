const pg = require('pg');
const postgresUrl = 'postgres://localhost/twittersql';
const client = new pg.Client(postgresUrl);
// conectando al servidor de postgres
client.connect();
// hacer el cliente disponible como un módulo de Node
module.exports = client;
