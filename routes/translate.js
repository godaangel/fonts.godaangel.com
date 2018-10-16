let express = require('express');
let router = express.Router();
var fs = require('fs');
let Render = require('../libs/render');
const fg = require('../libs/fonts2/fontGenerate');

router.get('/fonts', function(req, res, next) {

  var cwd = process.cwd();
  var svg1 = {
    file: 'public/upload/ic_play_list.svg'
  }
  var svg2 = {
    file: 'public/upload/ic_time_list1x.svg'
  }

  fg.generateFont({
    files: [svg1, svg2],
    fontName: 'godafont',
    outPath: 'public/fonts'
  }, function(err, file) {
    if (err) {
      Render.err(res, err);
      throw err;
    }
    if (file) {
      Render.success(res, {
        url: file
      });
    } else {
      Render.err(res);
    }
  })

});

module.exports = router;