function route(pathname, handle, response, postData, request) {
  if (typeof handle[pathname] === "function") {
    handle[pathname](response, postData, request);
    return true;
  } else {
    response.writeHead(404, { "Content-Type": "text/plain" });
    response.end("404 Not found");
    return false;
  }
}

exports.route = route;
