let express = require('express');
let router = express.Router();

let Font = require('../models/font/index');
let Render = require('../libs/render');

const fg = require('../libs/fonts2/fontGenerate');
var log = require('../libs/log').getLogger(__filename);

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


router.post('/add', function(req, res, next) {
  let font = new Font();

  let { name, file } = req.body;

  let addFont = async function() {
    let info = await font.insert({
      name: name,
      file: file
    });
    Render.success(res, info);
  }

  addFont().catch((err) => {
    Render.err(res, err);
  });
 
});


router.post('/translate', function(req, res, next) {
  
  let {files, fontName} = req.body

  fg.generateFont({
    files: files,
    fontName: fontName || 'wiifont',
    outPath: 'public/fonts'
  }, function(err, file) {
    if (err) {
      log.error(err);
      Render.err(res, err);
      throw err;
    }
    if (file) {
      Render.success(res, {
        url: file
      });
    } else {
      Render.err(res, 'generateFont 没有找到文件!');
    }
  })

});

module.exports = router;