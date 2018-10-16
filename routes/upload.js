let express = require('express')
let router = express.Router()
let Render = require('../libs/render')

let multer = require('multer')
var storage = multer.diskStorage({
  //设置上传后文件路径，uploads文件夹会自动创建。
  destination: function(req, file, cb) {
    cb(null, 'public/upload')
  },
  //给上传文件重命名，获取添加后缀名
  filename: function(req, file, cb) {
    var fileFormat = (file.originalname).split(".");
    cb(null, file.fieldname + '-' + Date.now() + "." + fileFormat[fileFormat.length - 1]);
  }
})
let upload = multer({
  storage: storage
})

router.post('/upload', upload.single('avatar'), function(req, res, next) {
  let url = '//' + req.headers.host + '/upload/' + req.file.filename
  Render.success(res, {
    img_url: url
  })
})

module.exports = router