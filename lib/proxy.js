import { readFileSync } from 'fs';
import { createProxyMiddleware } from 'http-proxy-middleware';

const log = require('@ui5/logger').getLogger('server:custommiddleware:backendproxy');

/**
 * Proxy to backend server with basic authorization
 *  configuration (file or input parameters)
 *   - target (https://server.com:443) - required
 *   - secure (true/false) - turn off/on strict secure flag (also for cookie)
 *   - changeOrigin (true/false)
 *   - auth (username:password) - for simple authorization
 *   - debug (true/false) - turn on debug messages
 *   - configFilePath (path to config file) - parameters not compare - use file or input parameters
 *
 * @param  {} {resources
 * @param  {} options}
 */
export default function({ resources, options }) {
  if (!options || !options.configuration) throw new Error('Configuration not found!');

  let configuration = options.configuration;
  let bDebug = options.configuration.debug;
  if (configuration && configuration.configFilePath) {
    try {
      let fileContent = readFileSync(configuration.configFilePath);
      configuration = JSON.parse(fileContent);
      if (bDebug) log.info(`Work with configuration file ${options.configuration.configFilePath}`);
    } catch (error) {
      log.warn(`Error by read configuration file ${options.configuration.configFilePath}`);
      log.info(error.message);
    }
  }

  if (!configuration.target) throw new Error('Target is not defined!');

  const proxySetting = {
    auth: configuration.auth,
    target: configuration.target,
    secure: configuration.secure,
    changeOrigin: configuration.changeOrigin,
  };

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

  if (bDebug) log.info(`Starting proxy for target ${proxySetting.target}`);
  return createProxyMiddleware(proxySetting);
}
