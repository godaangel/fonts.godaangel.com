let express = require('express');
let router = express.Router();

let Font = require('../models/font/index');
let Render = require('../libs/render');

router.get('/list', function(req, res, next) {
  let font = new Font();
  let getFontList = async function() {
  	let list = await font.list({
	    currentPage: 1,
	    pageSize: 20,
      orderBy: {
        create_time: 'desc'
      }
	  });
  	Render.success(res, list);
  }
  getFontList().catch((err) => {
  	Render.err(res, err);
  });

});

module.exports = router;