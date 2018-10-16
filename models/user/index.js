/**
 * User的基本操作类
 * @type {[type]}
 */
// 引入查询模块
let Query = require('../../libs/query')

let Base = require('../base/index')

//这个引入主要是用来写【带占位符的SQL语句】，在这个Model里其实没啥用了，如果没有特殊的SQL查询，可以不引入
// let userSql = require('../../dao/user/index')

class User extends Base{
	constructor() {
		// 设置表名
		let tableName = 'user'
    super(tableName)
	}

	/**
	 * 获取用户列表, 此处通过Base继承了list方法
	 * @Author   warrenyang@tencent.com
	 * @DateTime 2018-07-07
	 */

	/**
	 * 查询用户信息, 此处通过Base继承了getById方法
	 * @Author   warrenyang@tencent.com
	 * @DateTime 2018-07-07
	 */
	// userInfo(...params){
	// 	return Query(userSql.queryById, [...params]);
	// }

	/**
	 * 新增用户, 此处通过Base继承了insert方法, 并做了复写, 加入时间戳, 并通过super方法调用了父类方法
	 * @Author   warrenyang@tencent.com
	 * @DateTime 2018-07-07
	 */
	insert(params){
		let timestamp = new Date().getTime()
		return super.insert({
			username: params.username, 
      password: params.password,
      create_time: timestamp,
      update_time: timestamp
		})
	}

	/**
	 * 删除用户, 此处通过Base继承了delete方法
	 * @Author   warrenyang@tencent.com
	 * @DateTime 2018-07-07
	 */
	// delete(...params){
	// 	return Query(userSql.delete, [...params]);
	// }

}

module.exports = User