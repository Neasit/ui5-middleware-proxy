const dotenv = require('dotenv');
const proxy = require('http-proxy-middleware');
const log = require('@ui5/logger').getLogger('server:custommiddleware:backendproxy');

/**
 * Proxy to backend server with basic authorization
 *  configuration (env or input parameters)
 *   - target (https://server.com:443) - required
 *   - secure (true/false) - turn off/on strict secure flag (also for cookie)
 *   - changeOrigin (true/false)
 *   - auth (username:password) - for simple authorization
 *   - debug (true/false) - turn on debug messages
 *   - client - sap client
 *
 * @param  {} {resources
 * @param  {} options}
 */
module.exports = function({ resources, options }) {
  const envResult = dotenv.config();
  const envParsed = envResult.parsed || {};
  let configuration = options && options.configuration ? options.configuration : {};
  let bDebug = configuration.debug || false;

  const proxySetting = {
    auth: configuration.auth || envParsed.PROXY_AUTH,
    target: configuration.target || envParsed.PROXY_TARGET,
    secure: configuration.secure || envParsed.PROXY_SECURE,
    changeOrigin: configuration.changeOrigin || envParsed.PROXY_CHANGE_ORIGIN,
    client: configuration.client || envParsed.PROXY_CLIENT,
  };

  if (!proxySetting.target) throw new Error('Target is not defined!');

  if (bDebug) log.info('Settings: ' + JSON.stringify(proxySetting));

  if (!proxySetting.secure) {
    proxySetting.onProxyRes = function(proxyRes) {
      const sc = proxyRes.headers['set-cookie'];
      if (Array.isArray(sc)) {
        proxyRes.headers['set-cookie'] = sc.map(item => {
          return item
            .split(';')
            .filter(v => v.trim().toLowerCase() !== 'secure')
            .join('; ');
        });
      }
    };
  }

  if (!proxySetting.client) {
    proxySetting.pathRewrite = function(path) {
      const clientQuery = 'sap-client';
      const separator = path.indexOf('?') !== -1 ? '&' : '?';
      let newPath = path;
      if (path.indexOf(clientQuery) === -1) {
        newPath = path + separator + clientQuery + '=' + proxySetting.client;
      }
      return newPath;
    };
  }

  if (bDebug) log.info(`Starting proxy for target ${proxySetting.target}`);
  return proxy.createProxyMiddleware(proxySetting);
};
