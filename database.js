
const sqlite3 = require('sqlite3').verbose()

const databaseName = 'pumpkinDB.db'
const db = new sqlite3.Database(databaseName,(err) => {
    if (err) {
      console.error('Could not connect to database', err);
    } else {
      console.log('SQLite database Connected sucessfully');
    }
  });

db.serialize(()=>{

    // user table
    db.run(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          email TEXT UNIQUE NOT NULL,
          password TEXT NOT NULL,
          name TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
        `)

     // Auction items table
     db.run(`
        CREATE TABLE IF NOT EXISTS auction (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          description TEXT,
          current_bid INTEGER DEFAULT 100,
          last_bidder_id INTEGER,
          last_bid_time DATETIME,
          is_locked BOOLEAN DEFAULT 0,
          FOREIGN KEY(last_bidder_id) REFERENCES users(id)
        )
      `);

      //Bid items table
      db.run(`
        CREATE TABLE IF NOT EXISTS bids_items (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          item_id INTEGER NOT NULL,
          user_id INTEGER NOT NULL,
          bid_amount INTEGER NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY(item_id) REFERENCES auction(id),
          FOREIGN KEY(user_id) REFERENCES users(id)
        )
      `);

})

module.exports = db;