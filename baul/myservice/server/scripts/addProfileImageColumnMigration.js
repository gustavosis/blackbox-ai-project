const db = require('../db');

db.serialize(() => {
  db.get("SELECT * FROM pragma_table_info('users') WHERE name='profileImage'", (err, row) => {
    if (!row) {
      console.log("Adding 'profileImage' column to users table...");
      db.run("ALTER TABLE users ADD COLUMN profileImage TEXT", (err) => {
        if (err) {
          console.error("Error adding 'profileImage' column:", err);
        } else {
          console.log("'profileImage' column added successfully.");
        }
      });
    } else {
      console.log("'profileImage' column already exists.");
    }
  });
});
