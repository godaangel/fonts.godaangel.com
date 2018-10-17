let express = require('express');
let router = express.Router();

let Project = require('../models/project/index');
let Render = require('../libs/render');

router.get('/list', function(req, res, next) {
  let project = new Project();
  let getProjectList = async function() {
  	let list = await project.getListWithSvgs();
    for(let i in list.list) {
      list.list[i].svgs = []
      if(list.list[i].svgs_name) {
        let svgNameArr = list.list[i].svgs_name.split(',')
        let svgFileArr = list.list[i].svgs_file.split(',')
        for(let j in svgNameArr) {
          list.list[i].svgs.push({
            name: svgNameArr[j],
            file: svgFileArr[j]
          })
        }
      }
    }
  	Render.success(res, list);
  }
  getProjectList().catch((err) => {
  	Render.err(res, err);
  });

});

router.post('/add', function(req, res, next) {
  let project = new Project();

  let { name, icons_id } = req.body;

  let addProject = async function() {
    let info = await project.insert({
      name: name,
      icons_id: icons_id
    });
    Render.success(res, info);
  }

  addProject().catch((err) => {
    Render.err(res, err);
  });

});

router.post('/update', function(req, res, next) {
  let project = new Project();

  let { id, name, icons_id } = req.body;

  let updateProject = async function() {
    let info = await project.update({
      name: name,
      id: id,
      icons_id: icons_id,
      update_time: new Date().getTime()
    });

    if(info.affectedRows){
      Render.success(res, info)
    }else{
      Render.err(res, '没有找到该用户')
    }
  }

  updateProject().catch((err) => {
    Render.err(res, err);
  });

});
module.exports = router;