"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _path = _interopRequireDefault(require("path"));

var _macacaDatahub = _interopRequireDefault(require("macaca-datahub"));

var _detectPort = _interopRequireDefault(require("detect-port"));

var _deasyncPromise = _interopRequireDefault(require("deasync-promise"));

var _assert = _interopRequireDefault(require("assert"));

var _lodash = _interopRequireDefault(require("lodash.isplainobject"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _objectWithoutProperties(source, excluded) { if (source == null) return {}; var target = _objectWithoutPropertiesLoose(source, excluded); var key, i; if (Object.getOwnPropertySymbols) { var sourceSymbolKeys = Object.getOwnPropertySymbols(source); for (i = 0; i < sourceSymbolKeys.length; i++) { key = sourceSymbolKeys[i]; if (excluded.indexOf(key) >= 0) continue; if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue; target[key] = source[key]; } } return target; }

function _objectWithoutPropertiesLoose(source, excluded) { if (source == null) return {}; var target = {}; var sourceKeys = Object.keys(source); var key, i; for (i = 0; i < sourceKeys.length; i++) { key = sourceKeys[i]; if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } return target; }

const proxyMiddleware = require('http-proxy-middleware');

var _default = (app, opts = {}) => {
  const defaultOptions = {
    port: 7981,
    hostname: 'localhost',
    store: _path.default.join(process.cwd(), 'data'),
    protocol: 'http',
    prefix: '',
    view: {
      assetsUrl: 'https://unpkg.com/datahub-view@2'
    }
  };
  let realProxy = {};

  if (typeof opts === 'string' || typeof opts.proxy === 'string') {
    const hub = opts;
    realProxy[`/${hub}`] = {
      hub
    };
    opts = {};
  }

  if (Array.isArray(opts) || Array.isArray(opts.proxy)) {
    realProxy = (opts.proxy || opts).reduce((real, hub) => {
      real[`/${hub}`] = {
        hub
      };
      return real;
    }, {});
    opts = {};
  }

  (0, _assert.default)((0, _lodash.default)(opts), `Options must be Object,Array,String, but got ${opts}`);

  const _Object$assign = Object.assign(opts, defaultOptions),
        proxy = _Object$assign.proxy,
        port = _Object$assign.port,
        protocol = _Object$assign.protocol,
        hostname = _Object$assign.hostname,
        view = _Object$assign.view,
        store = _Object$assign.store,
        prefix = _Object$assign.prefix;

  realProxy = (0, _lodash.default)(proxy) ? proxy : realProxy;
  const defaultDatahub = new _macacaDatahub.default();
  const finalPort = (0, _deasyncPromise.default)((0, _detectPort.default)(port));
  const target = `${protocol}://${hostname}:${finalPort}`;
  app.use('/datahub', (req, res, next) => {
    if (req.originalUrl === '/datahub') {
      res.redirect(`${target}/dashboard`);
      return;
    }

    next();
  });
  Object.keys(realProxy).forEach(router => {
    const finalConfig = realProxy[router];

    const hub = finalConfig.hub,
          pathRewrite = finalConfig.pathRewrite,
          otherOptions = _objectWithoutProperties(finalConfig, ["hub", "pathRewrite"]);

    router = router.indexOf('^') === 0 ? router.replace('^', '') : router;
    app.use(`^${prefix}${router}`, proxyMiddleware(_objectSpread({}, otherOptions, {
      target,
      pathRewrite: _objectSpread({}, pathRewrite, {
        [router]: `/data/${hub}/`
      })
    })));
  });
  defaultDatahub.startServer({
    port: finalPort,
    view,
    store
  }).then(() => {
    console.log('datahub ready');
  });
};

exports.default = _default;