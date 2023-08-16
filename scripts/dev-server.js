var liveServer = require('alive-server');

var params = {
  port: 8181, // Set the server port. Defaults to 8080.
  host: '0.0.0.0', // Set the address to bind to. Defaults to 0.0.0.0 or process.env.IP.
  root: './.build', // Set root directory that's being served. Defaults to cwd.
  open: true, // When false, it won't load your browser by default.
  // ignore: 'scss,my/templates', // comma-separated string for paths to ignore
  file: 'index.html', // When set, serve this file (server root relative) for every 404 (useful for single-page applications)
  wait: 1000, // Waits for all changes, before reloading. Defaults to 0 sec.
  // mount: [['/components', './node_modules']], // Mount a directory to a route.
  logLevel: 2, // 0 = errors only, 1 = some, 2 = lots
  index: 'index.html,index.js', // By default send supports "index.html" files, to disable this set false or to supply a new index pass a string or an array in preferred order
};

liveServer.start(params);
