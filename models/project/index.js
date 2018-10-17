/**
 * Project的基本操作类
 * @type {[type]}
 */
// 引入查询模块
let Query = require('../../libs/query')
let Base = require('../base/index')
let lodash = require('lodash')

class Project extends Base{
	constructor() {
		let tableName = 'project'
    super(tableName)
	}

	insert(params){
		let timestamp = new Date().getTime()
		params = lodash.merge(params, {
      create_time: timestamp,
      update_time: timestamp
		})
		return super.insert(params)
	}

	getListWithSvgs(params) {
		var sqlStr = `select project.id,project.name, project.icons_id, group_concat(svg.name) as svgs_name, group_concat(svg.file) as svgs_file from project left join svg on find_in_set(svg.id,project.icons_id) group by project.id`

		let getListWithSvgs = async function() {
      let list = await Query(sqlStr)
      let result = {
        list: list
      }
      return result
    }

    return getListWithSvgs()
	}
}

module.exports = Project