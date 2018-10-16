'use strict';

const uuid = require('uuid');
const fs = require('fs');

/**
 * 获取一个随机UUID
 * @returns {XML|*|string|void}
 * @public
 */
module.exports.UUID = () => uuid.v4().replace(/-/g, '');
/**
 * 删除文件夹及其下所有文件
 * @param  {string} path 文件夹路径
 */
const deleteFolder = module.exports.deleteFolder = function(path) {
  let files = [];
  if (fs.existsSync(path)) {
    files = fs.readdirSync(path);
    files.forEach(function(file, index) {
      const curPath = `${path}/${file}`;
      if (fs.statSync(curPath).isDirectory()) { // recurse
        deleteFolder(curPath);
      } else { // delete file
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(path);
  }
};
/**
 * 时间格式
 * @param time 需要转换的时间如：new Date()
 * @param fmt 时间格式：如：'yyyy-MM-dd hh:mm:ss'
 * @returns 返回安装时间格式的时间
 */
module.exports.format = (time, fmt) => {
  let result = fmt;
  const o = {
    'y+': time.getFullYear(),
    'M+': time.getMonth() + 1,
    'd+': time.getDate(),
    'h+': time.getHours(),
    'm+': time.getMinutes(),
    's+': time.getSeconds(),
  };
  if (/(y+)/.test(fmt)) {
    const fullYear = time.getFullYear();
    result = fmt.replace(RegExp.$1, (`${fullYear}`).substr(4 - RegExp.$1.length));
  }
  Object.keys(o).forEach((item) => {
    const value = o[item];
    if (new RegExp(`(${item})`).test(result)) {
      result = result.replace(RegExp.$1,
        (RegExp.$1.length === 1) ? value : ((`00${value}`).substr(`${value}`.length)));
    }
  });
  return result;
}

/**
 * unicode转码
 * @Author   Warrenyang
 * @DateTime 2018-10-16
 */
module.exports.encodeUnicode = (str) => {
  let res = [];
  for (let i = 0; i < str.length; i++) {
    res[i] = ('00' + str.charCodeAt(i).toString(16).toUpperCase()).slice(-4);
  }
  return '\\' + res.join('\\');
}