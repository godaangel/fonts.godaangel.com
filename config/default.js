/**
 * Created by yaoguofeng on 2017/08/09.
 *
 * default config.
 *
 */

'use strict';

const path = require('path');

const root = process.cwd(); // 进程运行当前目录

module.exports = {
  // 日志配置
  log: {
    // 默认为工作目录下 logs
    dir: path.join(root, 'logs'),
    // 默认 info
    level: 'debug',
  },
  // 服务器配置
  mysql: {
    host: '127.0.0.1',
    user: 'root',
    password: 'Ailn1314',
    database: 'font_center',
    port: 3306
  }
};
