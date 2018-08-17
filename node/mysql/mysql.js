const mysql = require('mysql');

const config = require('../config')
const database = config.database

const pool = mysql.createPool({
  host: database.HOST,
  user: database.USER,
  password: database.PASSWORD,
  database: database.DATABASE
})

let query = function( sql, values ) {
  return new Promise(( resolve, reject ) => {
    pool.getConnection(function(err, connection) {
      if (err) {
        reject( err )
      } else {
        connection.query(sql, values, ( err, rows) => {
          if ( err ) {
            // console.log('connection.query in err==>')
            // console.log(err)
            reject( err )
          } else {
            // console.log('connection.query in rows==>')
            // console.log(rows)
            resolve( rows )
          }
          connection.release()
        })
      }
    })
  })
    .catch((error) => {
      console.log(error,'Promise error');
      throw error
    });
}

module.exports = { query }
