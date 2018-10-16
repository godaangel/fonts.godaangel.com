let express = require('express');
let router = express.Router();

let Project = require('../models/project/index');
let Render = require('../libs/render');

router.get('/list', function(req, res, next) {
  let project = new Project();
  let getProjectList = async function() {
  	let list = await project.list({
	    currentPage: 1,
	    pageSize: 20,
      orderBy: {
        create_time: 'desc'
      }
	  });
  	Render.success(res, list);
  }
  getProjectList().catch((err) => {
  	Render.err(res, err);
  });

});

module.exports = router;