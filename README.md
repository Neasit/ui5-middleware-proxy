# UI5 Middleware proxy

  Middleware extension for ui5 server (https://github.com/SAP/ui5-server)[ui5-server]
  This proxy will correct work with SAP_SESSIONID cookie and provide authorization to server

## Install

  `npm install ui5-middleware-proxy --save-dev`

## Configuration

These parameters can be provided as a options in ui5.yaml configuration or be stored as a env. varibles (file `.env` - (EXAMPLE))

  - `target` {string} - url destination (PROXY_TARGET)
  - `secure` {boolean} - turn off/on verification of certificate and in case false - delete 'secure' tag from cookie (PROXY_SECURE)
  - `changeOrigin` {boolean} - changes the origin of the host header to the target URL (PROXY_CHANGE_ORIGIN)
  - `auth` {string} - basic authentication i.e. 'user:password' to compute an Authorization header (PROXY_AUTH)
  - `langu` {string} - language will be provided as a URL parameter `sap-language` (PROXY_LANGU)
  - `debug` {boolean} - turn on/off additional messages (NO ENV PARAMETER!)
  - `client` {string} - SAP Client will be provided as a URL parameter `sap-client` (PROXY_CLIENT) 
  - `sslAuth` {boolean} - TLS authorization is required (PROXY_SSL)
  - `certPath` {string} - path fromt project root to client certificate in PFX format (PROXY_CERT_PATH)  

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
        target: 'https://server.com:443'
        secure: false
        changeOrigin: true
        auth: "username:password"
        debug: true
        langu: 'DE'
        client: '200'
  ```


