let express = require('express')
let router = express.Router()
let Render = require('../libs/render')

let multer = require('multer')
var storage = multer.diskStorage({
  //设置上传后文件路径，uploads文件夹会自动创建。
  destination: function(req, file, cb) {
    cb(null, 'public/uploads')
  },
  //给上传文件重命名，获取添加后缀名
  filename: function(req, file, cb) {
    cb(null, file.originalname);
  }
})
let upload = multer({
  storage: storage
})

router.post('/upload', upload.single('file'), function(req, res, next) {
  let url = '//' + req.headers.host + '/uploads/' + req.file.filename
  Render.success(res, {
    src: url,
    file: '/uploads/' + req.file.filename,
    name: req.file.filename
  })
})

module.exports = router