const server = require('./server');
const router = require('./router');
const requestHandlers = require('./requestHandlers');

const handle = {};
handle['/'] = requestHandlers.start;
handle['/start'] = requestHandlers.start2;
handle['/upload'] = requestHandlers.upload;
handle['/file'] = requestHandlers.file;
handle['/file/upload'] = requestHandlers.fileUpload;
handle['/file/download'] = requestHandlers.fileDownload;

server.start(router.route, handle);