# UI5 Middleware proxy

  Middleware extension for ui5 server (https://github.com/SAP/ui5-server)[ui5-server]
  This proxy will correct work with SAP_SESSIONID cookie and provide authorization to server

## Install

  `npm install ui5-middleware-proxy --save-dev`

## Configuration

  - `target` {string} - url destination
  - `secure` {boolean} - turn off/on verification of certificate and in case false - delete 'secure' tag from cookie
  - `changeOrigin` {boolean} - changes the origin of the host header to the target URL
  - `auth` {string} - basic authentication i.e. 'user:password' to compute an Authorization header
  - `debug` {boolean} - turn on/off additional messages
  - `configFilePath` {string} - path to config file (all options will be loaded from file and parameters will be ignored)

## Usage

  package.json - add as dependency

  ```json
  "devDependencies": {
      // ...
      "ui5-middleware-proxy": "*"
      // ...
  },
  "ui5": {
    "dependencies": [
      // ...
      "ui5-middleware-proxy",
      // ...
    ]
  }
  ```

  ui5.yaml - add configuration

  ```yaml
  server:
    customMiddleware:
    - name: ui5-middleware-proxy
      afterMiddleware: compression
      mountPath: /sap
      configuration:
        target: "https://server.com:443"
        secure: false
        changeOrigin: true
        auth: "username:password"
        debug: true
  ```


