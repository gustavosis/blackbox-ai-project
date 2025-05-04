const db = require('../db');

db.serialize(() => {
  db.get("SELECT * FROM pragma_table_info('users') WHERE name='service'", (err, row) => {
    if (!row) {
      console.log("Adding 'service' column to users table...");
      db.run("ALTER TABLE users ADD COLUMN service TEXT", (err) => {
        if (err) {
          console.error("Error adding 'service' column:", err);
        } else {
          console.log("'service' column added successfully.");
        }
      });
    } else {
      console.log("'service' column already exists.");
    }
  });

  db.get("SELECT * FROM pragma_table_info('users') WHERE name='phone'", (err, row) => {
    if (!row) {
      console.log("Adding 'phone' column to users table...");
      db.run("ALTER TABLE users ADD COLUMN phone TEXT", (err) => {
        if (err) {
          console.error("Error adding 'phone' column:", err);
        } else {
          console.log("'phone' column added successfully.");
        }
      });
    } else {
      console.log("'phone' column already exists.");
    }
  });
});
