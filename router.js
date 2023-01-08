function route(pathname, handle, response, postData) {
  if (typeof handle[pathname] === "function") {
    handle[pathname](response, postData);
    return true;
  } else {
    response.writeHead(404, { "Content-Type": "text/plain" });
    response.end("404 Not found");
    return false;
  }
}

exports.route = route;
