const dotenv = require('dotenv');
const proxy = require('http-proxy-middleware');
const fs = require('graceful-fs');
const path = require('path');
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
    secure: configuration.secure || envParsed.PROXY_SECURE === 'true',
    changeOrigin: configuration.changeOrigin || envParsed.PROXY_CHANGE_ORIGIN === 'true',
    client: configuration.client || envParsed.PROXY_CLIENT,
    langu: configuration.langu || envParsed.PROXY_LANGU,
    sslAuth: configuration.ssl || envParsed.PROXY_SSL === 'true',
    certPath: configuration.certPath || 'certificates/develop/client_certs/_ZDANOVA.p12',
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

  if (proxySetting.sslAuth) {
    log.info(`Dir = ${__dirname}`);
    let oTarget = {
      protocol: 'https:', // this is required
      host: 'localhost',
      port: '443',
      path: '/',
      pfx: fs.readFileSync(path.join(__dirname, '../../../' + proxySetting.certPath)),
    };

    proxySetting.target = oTarget;

    /*
    proxySetting.onProxyReq = function(proxyReq, req, res) {
      const parseReqCert = req => {
        const { socket } = req;
        const prefix = '-----BEGIN CERTIFICATE-----';
        const postfix = '-----END CERTIFICATE-----';
        const pemText = socket
          .getPeerCertificate(true)
          .raw.toString('base64')
          .match(/.{0,64}/g);

        return [prefix, pemText, postfix].join('\n');
      };

      const addClientCert = (proxyReq, req) => {
        proxyReq.cert = parseReqCert(req);
        return proxyReq;
      };
      addClientCert(proxyReq, req);
    };
    */
  }

  if (proxySetting.client) {
    if (bDebug) log.info(`Proxy client = ${proxySetting.client}`);
    if (bDebug) log.info(`Proxy language = ${proxySetting.langu}`);
    proxySetting.pathRewrite = function(path) {
      if (bDebug) log.info(`Path = ${path}`);
      const clientQuery = 'sap-client';
      const languQuery = 'sap-language';
      const reLangu = new RegExp('([?&])' + languQuery + '=.*?(&|$)', 'i');
      let newPath = path;
      let separator = newPath.indexOf('?') !== -1 ? '&' : '?';
      if (path.indexOf(clientQuery) === -1) {
        newPath = path + separator + clientQuery + '=' + proxySetting.client;
      }
      separator = newPath.indexOf('?') !== -1 ? '&' : '?';
      if (newPath.match(reLangu)) {
        newPath = newPath.replace(reLangu, '$1' + languQuery + '=' + proxySetting.langu + '$2');
      } else {
        newPath = newPath + separator + languQuery + '=' + proxySetting.langu;
      }
      if (bDebug) log.info(`New path = ${newPath}`);
      return newPath;
    };
  }

  if (bDebug) log.info(`Starting proxy for target ${proxySetting.target}`);
  return proxy.createProxyMiddleware(proxySetting);
};
