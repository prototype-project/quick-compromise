var host = process.env.HOST || '127.0.0.1';
// Listen on a specific port via the PORT environment variable
var port = process.env.PORT || 9001;

var cors_proxy = require('cors-anywhere');
cors_proxy.createServer({
  originWhitelist: [], // Allow all origins
}).listen(port, host, function() {
  console.log('Running CORS Anywhere on ' + host + ':' + port);
});