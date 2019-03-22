import path from 'path'
import DataHub from 'macaca-datahub'
import detectPort from 'detect-port'
import desyncPromise from 'deasync-promise'
import assert from 'assert'
import isPlainObject from 'lodash.isplainobject'

const proxyMiddleware = require('http-proxy-middleware')

export default (app, opts = {}) => {
  const defaultOptions = {
    port: 7981,
    hostname: 'localhost',
    store: path.join(process.cwd(), 'data'),
    protocol: 'http',
    prefix: '',
    view: {
      assetsUrl: 'https://unpkg.com/datahub-view@2'
    }
  }
  let realProxy = {}
  if (typeof opts === 'string' || typeof opts.proxy === 'string') {
    const hub = opts
    realProxy[`/${hub}`] = {
      hub
    }
    opts = {}
  }

  if (Array.isArray(opts) || Array.isArray(opts.proxy)) {
    realProxy = (opts.proxy || opts).reduce((real, hub) => {
      real[`/${hub}`] = {
        hub
      }
      return real
    }, {})
    opts = {}
  }

  assert(
    isPlainObject(opts),
    `Options must be Object,Array,String, but got ${opts}`
  )

  const {
    proxy,
    port,
    protocol,
    hostname,
    view,
    store,
    prefix
  } = Object.assign(opts, defaultOptions)
  realProxy = isPlainObject(proxy) ? proxy : realProxy

  const defaultDatahub = new DataHub()
  const finalPort = desyncPromise(detectPort(port))
  const target = `${protocol}://${hostname}:${finalPort}`
  app.use('/datahub', (req, res, next) => {
    if (req.originalUrl === '/datahub') {
      res.redirect(`${target}/dashboard`)
      return
    }
    next()
  })
  Object.keys(realProxy).forEach(router => {
    const finalConfig = realProxy[router]
    const { hub, pathRewrite, ...otherOptions } = finalConfig
    router = router.indexOf('^') === 0 ? router.replace('^', '') : router
    app.use(
      `^${prefix}${router}`,
      proxyMiddleware({
        ...otherOptions,
        target,
        pathRewrite: {
          ...pathRewrite,
          [router]: `/data/${hub}/`
        }
      })
    )
  })
  defaultDatahub
    .startServer({
      port: finalPort,
      view,
      store
    })
    .then(() => {
      console.log('datahub ready')
    })
}
