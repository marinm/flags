const mysql = require('mysql');

const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE
});

connection.connect(function(err) {
if (err)
    console.log("FAIL - connection to database");
else
    console.log("Connected to database");
});

function get_player_by_key(key, callback) {
    const query = "SELECT p_id, p_name FROM players WHERE p_key = \"" + key + "\"";
    connection.query(query, function(error, result) {
      if (error || result.length != 1) {
        console.log("database query error");
        callback(null);
      }
      else {
        callback({p_id: result[0].p_id, p_name: result[0].p_name});
      }
    });
}

module.exports = {get_player_by_key};