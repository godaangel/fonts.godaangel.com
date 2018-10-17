let express = require('express');
let router = express.Router();
var fs = require('fs');
let Render = require('../libs/render');
const fg = require('../libs/fonts2/fontGenerate');
var log = require('../libs/log').getLogger(__filename);

router.get('/fonts', function(req, res, next) {
  
  var cwd = process.cwd();
  var svg1 = {
    file: '/upload/compass.svg'
  }
  var svg2 = {
    file: '/upload/ic_time_list1x.svg'
  }

  fg.generateFont({
    files: [svg1, svg2],
    fontName: 'godafont',
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