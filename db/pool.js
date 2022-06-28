const { Pool } = require('pg')
const dotenv = require('dotenv');
dotenv.config();
const DB_Config = {
  // number of milliseconds to wait before timing out when connecting a new client
  // by default this is 0 which means no timeout
  connectionTimeoutMillis: 300,
  // number of milliseconds a client must sit idle in the pool and not be checked out
  // before it is disconnected from the backend and discarded
  // default is 10000 (10 seconds) - set to 0 to disable auto-disconnection of idle clients
  idleTimeoutMillis: 300,
  // maximum number of clients the pool should contain
  // by default this is set to 10.
  max: 20,
  connectionString: process.env.DATABASE_URL, // e.g. postgres://user:password@host:5432/database
  
}
const pool = new Pool(DB_Config)
pool.on('connect', client => {
  
      console.log("database is connected")
    
   
  
})
pool.on('remove', client => {
    client.end();
    console.log("database connection is removed")
})

module.exports = pool;