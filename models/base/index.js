/**
 * 基本操作类, 所有的Model的增删改查都可以继承这个类
 * warrenyang@tencent.com
 */

// 引入基础dao类
let BaseDao = require('../../dao/base/index')

class Base {
  constructor(tableName) {
    this.baseDao = new BaseDao(tableName)
  }

  /**
   * 获取列表, 包含了条件查询和排序
   * @Author   warrenyang@tencent.com
   * @DateTime 2018-07-19
   */
  list(params) {
    return this.baseDao.list(params)
  }

  /**
   * 根据Id获取详情
   * @Author   warrenyang@tencent.com
   * @DateTime 2018-07-19
   */
  getById(id) {
  	return this.baseDao.getById(id)
  }

  /**
   * 插入一条数据
   * @Author   warrenyang@tencent.com
   * @DateTime 2018-07-19
   * @param    {Object}   params key-value模式的参数
   */
  insert(params) {
    return this.baseDao.insert(params)
  }

  /**
   * 更新一条数据
   * @Author   warrenyang@tencent.com
   * @DateTime 2018-07-19
   * @param    {Object}  params key-value模式的参数，必须包含id
   */
  update(params) {
    return this.baseDao.update(params)
  }

  /**
   * 删除一条数据
   * @Author   warrenyang@tencent.com
   * @DateTime 2018-07-19
   */
  delete(id) {
  	return this.baseDao.delete(id)
  }
}

module.exports = Base