/**
 * Font的基本操作类
 * @type {[type]}
 */
// 引入查询模块
let Query = require('../../libs/query')

let Base = require('../base/index')

class Font extends Base{
	constructor() {
		let tableName = 'svg'
    super(tableName)
	}

	insert(params){
		let timestamp = new Date().getTime()
		return super.insert({
      create_time: timestamp,
      update_time: timestamp
		})
	}
}

module.exports = Font