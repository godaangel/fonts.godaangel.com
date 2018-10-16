/**
 * Created by feichenxi on 2016/4/15.
 *
 * 设置日志
 *
 */

'use strict';

const fs = require('fs');
const path = require('path');
const util = require('util');
const config = require('config');
const moment = require('moment');
const winston = require('winston');
const WinstonDailyRotateFile = require('winston-daily-rotate-file');

/**
 * 项目根目录
 * @type {string}
 */
const ROOT = path.dirname(path.dirname(__dirname));

/**
 * 日志保存目录
 * @type {string|*}
 */
const DIR = config.has('log.dir') ? config.get('log.dir') : path.join(ROOT, 'logs');

/**
 * 日志输出等级
 * @type {string}
 */
const LEVEL = config.has('log.level') ? config.get('log.level') : 'info';

// 判断是否存在日志目录，如果没有创建此目录
if (!fs.existsSync(DIR)) {
  fs.mkdirSync(DIR);
}

/**
 * 时间格式化
 * @returns {string|*}
 * @private
 */
function timestamp() {
  return moment().format('YYYY-MM-DD HH:mm:ss.SSS(Z)');
}

/**
 * 设置默认 transports
 * @type {*|[]}
 */
winston.loggers.options.transports = [
  // 替代默认控制台
  new (winston.transports.Console)({
    level: LEVEL,
    colorize: 'all',
    label: 'console',
    timestamp,
  }),
  // 分日期写入日志文件
  new (WinstonDailyRotateFile)({
    level: LEVEL,
    label: 'file',
    filename: path.join(DIR, 'normal.log'),
    timestamp,
  }),
];

/**
 * 获取 logger
 * @param name
 * @returns {*}
 * @public
 */
module.exports.getLogger = (name) => {
  if (!winston.loggers.has(name)) {
    let logger = winston.loggers.add(name).filters.push((level, msg) => `[${name}] ${msg}`);
  }
  return winston.loggers.get(name);
};

/**
 * koa日志中间件打印格式
 *
 * addr, method, url
 * HTTP/version, content-length, user-agent
 *
 */
const REQ_FORMAT = '%s - %s %s';
const INFO_FORMAT = 'HTTP/%s, %s %s';

/**
 * koa日志中间件使用的logger实例
 * @type {*}
 */
const httpLog = exports.getLogger('http');

/**
 * koa日志中间件
 * @returns {*}
 * @public
 */
module.exports.getConnect = () => (async (ctx, next) => {
  const request = ctx.request;
  const header = request.header;
  const req = ctx.req;
  const reqStr = util.format(REQ_FORMAT, request.ip, request.method, request.url);
  const str = util.format(INFO_FORMAT, req.httpVersion, request.length || 0, header['user-agent']);
  httpLog.debug(`${reqStr} ${str}`);
  await next();
});
