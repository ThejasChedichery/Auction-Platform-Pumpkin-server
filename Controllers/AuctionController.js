
const db = require('../database')

// Create a new auction item
const CreateAuctionItem = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Item name is required" });
    }

    db.run(
      `INSERT INTO auction (name, description, current_bid, is_locked) VALUES (?, ?, 100, 0)`,
      [name, description],
      function (err) {
        if (err) {
          return res.status(500).json({ message: "DB insert error: " + err.message });
        }

        res.status(201).json({
          success: true,
          message: "Auction item created successfully",
          item: { id: this.lastID, name, description, current_bid: 100 }
        });
      }
    );
  } catch (err) {
    res.status(500).json({ message: "Error creating auction item: " + err.message });
  }
};

// Get all auction items
const GetAuctionItems = async (req, res) => {
  db.all("SELECT a.*, u.name as last_bidder FROM auction a LEFT JOIN users u ON a.last_bidder_id = u.id", [], (err, rows) => {
    if (err) {
      return res.status(500).json({ message: "DB fetch error: " + err.message });
    }
    res.status(200).json({
  success: true,
  items: rows.map(row => ({
    ...row,
    is_locked: row.is_locked === 1 ? true : false,
  }))
});
  });
};

// Bid placing
const PlaceBid = (req, res) => {
    const itemId = req.params.id;
    const userId = req.id; 
  
    db.serialize(() => {
      db.run("BEGIN TRANSACTION");
  
      // 1. Get the current item
      db.get("SELECT * FROM auction WHERE id = ?", [itemId], (err, item) => {
        if (err || !item) {
          db.run("ROLLBACK");
          return res.status(404).json({ success: false, message: "Item not found" });
        }

        if (item.is_locked) {
          db.run("ROLLBACK");
          return res.status(423).json({ success: false, message: "Item is locked, try again later" });
        }

        const newBid = item.current_bid + 1;
  
        // 2. Lock the item immediately
        db.run("UPDATE auction SET is_locked = 1 WHERE id = ?", [itemId], (err2) => {
          if (err2) {
            db.run("ROLLBACK");
            return res.status(500).json({ success: false, message: "Error locking item" });
          }
  
          // 3. Insert bid
          db.run(
            "INSERT INTO bids_items (item_id, user_id, bid_amount) VALUES (?, ?, ?)",
            [itemId, userId, newBid],
            function (err3) {
              if (err3) {
                db.run("ROLLBACK");
                return res.status(500).json({ success: false, message: "Error placing bid" });
              }
  
              // 4. Update auction
              db.run(
                "UPDATE auction SET current_bid = ?, last_bidder_id = ?, last_bid_time = CURRENT_TIMESTAMP WHERE id = ?",
                [newBid, userId, itemId],
                (err4) => {
                  if (err4) {
                    db.run("ROLLBACK");
                    return res.status(500).json({ success: false, message: "Error updating auction" });
                  }
  
                  // 5. Commit changes
                  db.run("COMMIT");
  
                  // Unlock after 3s
                  setTimeout(() => {
                    db.run("UPDATE auction SET is_locked = 0 WHERE id = ?", [itemId]);
                  }, 3000);
  
                  return res.status(200).json({
                    success: true,
                    message: "Bid placed successfully",
                    bid: { itemId, userId, amount: newBid }
                  });
                }
              );
            }
          );
        });
      });
    });
  };
  

module.exports = { CreateAuctionItem, GetAuctionItems,PlaceBid }