let mysql = require('mysql')
let dbConfig = require('../config/database')
let pool = mysql.createPool(dbConfig.mysql)

let Query = function(...args) {
  return new Promise((resolve, reject) => {
    pool.getConnection(function(err, connection) {
      try {
        connection.query(args[0], args[1] || [], function(err, result) {
          if (err) {
            reject(err)
          }
          if (result) {
            resolve(result)
          }
          connection.release()
        })
      }catch(e) {
        reject(e)
      }
    })
  })
}

module.exports = Query