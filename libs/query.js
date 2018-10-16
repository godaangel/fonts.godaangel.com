const mysql = require('mysql')
const config = require('config');
const pool = mysql.createPool(config.get('mysql'))
const log = require('./log').getLogger(__filename);

let Query = function(...args) {
  return new Promise((resolve, reject) => {
    pool.getConnection(function(err, connection) {
      try {
        connection.query(args[0], args[1] || [], function(err, result) {
          if (err) {
            log.error(err)
            reject(err)
          }
          if (result) {
            resolve(result)
          }
          connection.release()
        })
      }catch(e) {
        log.error(e)
        reject(e)
      }
    })
  })
}

module.exports = Query