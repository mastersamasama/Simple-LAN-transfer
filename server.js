const http = require("http");
const url = require("url");

const port = 80;

function getLocalIP() {
  const os = require("os");
  const ifaces = os.networkInterfaces();
  let ip = "";
  // find the WLAN interface (WIN)
  // find the eth0 interface (Linux)
  // find the ens33 interface (Linux)
  // find the en0 interface (Mac)
  for (let dev in ifaces) {
    if (dev === "WLAN") {
      ifaces[dev].forEach(function (details) {
        if (details.family === "IPv4") {
          ip = details.address;
        }
      });
    } else if (dev === "eth0") {
      ifaces[dev].forEach(function (details) {
        if (details.family === "IPv4") {
          ip = details.address;
        }
      });
    } else if (dev === "ens33") {
      ifaces[dev].forEach(function (details) {
        if (details.family === "IPv4") {
          ip = details.address;
        }
      });
    } else if (dev === "en0") {
      ifaces[dev].forEach(function (details) {
        if (details.family === "IPv4") {
          ip = details.address;
        }
      });
    }
  }
  return ip;
}

let ip_win = getLocalIP();
if (ip_win) {
  console.log(
    "IP (Paste the IP into a browser to start): " +
      ip_win +
      (port === 80 ? "" : ":" + port)
  );
}

function startSerevr(route, handle) {
  function onRequest(request, response) {
    let postData = "";
    const pathname = url.parse(request.url).pathname;
    console.log("Request for " + pathname + " is received.");

    if (pathname === "/file") {
      request.setEncoding("binary");
    } else {
      request.setEncoding("utf8");
    }

    request.addListener("data", function (postDataChunk) {
      postData += postDataChunk;
    });

    request.addListener("end", function () {
      route(pathname, handle, response, postData);
    });
  }

  try {
    http.createServer(onRequest).listen(port);
    console.log("Server has started.");
  } catch (e) {
    console.log(e);
  }
}

exports.start = startSerevr;
