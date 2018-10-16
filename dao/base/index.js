/**
 * 基本查询类
 * warrenyang@tencent.com
 */

// 引入查询模块
let Query = require('../../libs/query')
let mysql = require('mysql')

class BaseDao {
  constructor(tableName) {
    this.tableName = tableName
  }
  
  /**
   * 获取列表, 包含了条件查询和排序
   * @Author   warrenyang@tencent.com
   * @DateTime 2018-07-19
   */
  list(params) {
    let that = this
      // 分页大小
    let pageSize = params.pageSize ? parseInt(params.pageSize) : 20
      // 当前开始查询数
    let from = (params.currentPage ? (params.currentPage - 1) : 0) * pageSize

    // 查询语句拼接，含条件查询
    let str = ''
    let valueArr = [] //存值数组
    let orderStr = ''
    for (let key in params) {
      if (key !== 'pageSize' && key !== 'currentPage' && key !== 'orderBy' && params[key]) {
        // 如果是.式分割，则表示带有修饰符，通过修饰符来判断查询类型，目前支持like；否则就执行条件and查询
        if (key.indexOf('.') !== -1) {
          let keyArr = key.split('.')
          let value = params[key]
          if (keyArr[1] === 'like') {
          	key = keyArr[0]
          	let formatKey = mysql.escapeId(key)
          	str += `and ${formatKey} like ? `
	        	valueArr.push(`%${value}%`)
          }
        }else{
        	let formatKey = mysql.escapeId(key) // 防止注入
	        str += `and ${formatKey}=? `
	        valueArr.push(params[key])
        }
      }

      /**
       * 判断是否有排序的关键字
       * @Author   Warrenyang
       * @DateTime 2018-07-20
       */
      if (key === 'orderBy') {
        orderStr = ' order by '
        for (let item in params[key]) {
        	if(['desc', 'DESC', 'asc', 'ASC'].indexOf(params[key][item]) == -1){
        		continue;
        	}else{
        		orderStr += `,${mysql.escapeId(item)} ${params[key][item]}`
        	}
          
        }
        orderStr = orderStr.replace(',', '') // 去掉第一个逗号
      }
    }
    let sqlStr = `select SQL_CALC_FOUND_ROWS * from ${this.tableName} where 1=1 ${str} ${orderStr} limit ?, ?`

    let getList = async function() {
    	let queryParams = valueArr
    	queryParams.push(from, pageSize)
      let list = await Query(sqlStr, queryParams)
      let pagination = await Query('select found_rows() as total')
      let result = {
        list: list,
        pagination: {
          currentPage: params.currentPage,
          pageSize: pageSize,
          total: pagination[0].total
        }
      }
      return result
    }
    return getList()
  }

  /**
   * 根据Id获取详情
   * @Author   warrenyang@tencent.com
   * @DateTime 2018-07-19
   */
  getById(id) {
  	let sqlStr = `select * from ${this.tableName} where id = ? `
    return Query(sqlStr, [id])
  }

  /**
   * 插入一条数据
   * @Author   warrenyang@tencent.com
   * @DateTime 2018-07-19
   * @param    {Object}   params key-value模式的参数
   */
  insert(params) {
  	let keyArr = [] // 关键字数组
  	let dotArr = [] // 占位符数组
    let valueArr = [] // 存值数组
    for (let key in params) {
      keyArr.push(mysql.escapeId(key)) // 防止注入
      dotArr.push('?')
      valueArr.push(params[key])
    }

    let sqlStr = `insert into ${this.tableName}(${keyArr.join(',')}) values(${dotArr.join(',')})`
    return Query(sqlStr, valueArr)
  }

  /**
   * 更新一条数据
   * @Author   warrenyang@tencent.com
   * @DateTime 2018-07-19
   * @param    {Object}  params key-value模式的参数，必须包含id
   */
  update(params) {
    let str = ''
    let valueArr = [] //存值数组
    for (let key in params) {
      if (key !== 'id' && key !== 'dbname') {
        let formatKey = mysql.escapeId(key) // 防止注入
        str += `,${formatKey} = ? `
        valueArr.push(params[key])
      }
    }
    str = str.replace(',', '')

    // 拼接sql语句，此处要考虑是否有注入风险，通过mysql.escapeId的方法防止注入
    let sqlStr = `update ${this.tableName} set ${str} where id = ?`
    valueArr.push(params.id)
    return Query(sqlStr, valueArr)
  }

  /**
   * 删除一条数据
   * @Author   warrenyang@tencent.com
   * @DateTime 2018-07-19
   */
  delete(id) {
  	let sqlStr = `delete from ${this.tableName} where id = ?`
    return Query(sqlStr, [id])
  }
}

module.exports = BaseDao