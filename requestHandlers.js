const htmlf = require("./thtml.js");
const querystring = require("querystring");

let textReceived = "";
let fileReceived = "";

let fileBuffer = {
  fileChunkArray: [],
  fileName: "",
  fileType: "notype",
};

let fileR = {
  fileChunkArray: [],
  fileName: "",
  fileType: "notype",
};

function start(response) {
  response.writeHead(200, { "Content-Type": "text/html" });
  response.write(htmlf.index());
  response.end();
}

function upload(response, postData) {
  response.writeHead(200, { "Content-Type": "text/html" });
  // if there is no post data, return the last text received
  if (postData === "" || postData == "message=&submit=") {
    response.end(htmlf.upload({ text_received: textReceived }));
    return;
  }
  textReceived = querystring.parse(postData).message;
  console.log(
    "Received text: " +
      textReceived.slice(0, 1000) +
      (textReceived.length > 1000 ? "..." : "")
  );
  response.end(htmlf.upload({ text_received: textReceived }));
}

function file(response) {
  response.writeHead(200, { "Content-Type": "text/html" });
  response.write(htmlf.file());
  response.end();
}

function fileUpload(response, postData, request) {
  // get requset header
  const header = request.headers;
  let copyToLocal = false;

  // if the request is done, save the file into fileR
  // and reset the fileBuffer
  if (header?.["done"] === "true") {
    const msg = JSON.parse(postData);
    response.writeHead(200, { "Content-Type": "text/json" });
    // change to utf8 from binary of file name
    let buf = Buffer.from(msg["file-name"], "binary");
    fileBuffer.fileName = buf.toString("utf8");
    fileBuffer.fileType = msg["content-type"] || "application/octet-stream";
    response.write(
      JSON.stringify({
        message: "done",
      })
    );
    fileR = fileBuffer;
    fileBuffer = {
      fileChunkArray: [],
      fileName: "",
      fileType: "notype",
    };
    response.end();
    console.log("file: " + fileR.fileName + " has been received.");

    if (copyToLocal) {
      const fs = require("fs");
      const buf = Buffer.from(fileR.fileChunkArray.join(""), "binary");
      const file = fs.createWriteStream("./" + fileR.fileName);
      file.write(buf);
    }
    return;
  }

  let index = Number(header["chunk-index"]);
  console.log("Received chunk: " + index + " from ip: " + request.socket.remoteAddress);
  fileBuffer.fileChunkArray[index] = postData;
  response.writeHead(200, { "Content-Type": "text/json" });
  response.write(
    JSON.stringify({
      message: "received",
    })
  );
  response.end();
}

function fileDownload(response, postData, request) {
  function standardResponse(msg, header = {}) {
    response.writeHead(200, { "Content-Type": "text/json", ...header });
    response.write(
      JSON.stringify({
        message: msg,
      })
    );
    response.end();
  }
  let header = request.headers;
  if (header?.["done"] === "false") {
    standardResponse({
      totalChunk: fileR.fileChunkArray.length,
    });
    console.log("file: " + fileR.fileName + " has been request.");
    return;
  }
  if (header?.["done"] === "true") {
    standardResponse({
      message: "done",
      "content-type": fileR.fileType,
      "file-name": fileR.fileName,
    });
    console.log("file: " + fileR.fileName + " has been sent.");
    return;
  }
  let index = Number(header["chunk-index"]);
  if (!fileR.fileChunkArray[index]) {
    standardResponse("error");
    return;
  }
  response.writeHead(200, {
    "Content-Type": "application/octet-stream",
    "Content-Length": fileR.fileChunkArray[index].length,
    "Piece-Index": index,
  });
  // will got an bug that randomly insert some 8-bit data if send the chunk directly
  let ab = new ArrayBuffer(fileR.fileChunkArray[index].length);
  let view = new Uint8Array(ab);
  for (let i = 0; i < fileR.fileChunkArray[index].length; i++) {
    view[i] = fileR.fileChunkArray[index].charCodeAt(i);
  }
  console.log("Send chunk: " + index + " to ip: " + request.socket.remoteAddress);
  response.write(view);
  response.end();
}

exports.start = start;
exports.upload = upload;
exports.file = file;
exports.fileUpload = fileUpload;
exports.fileDownload = fileDownload;
