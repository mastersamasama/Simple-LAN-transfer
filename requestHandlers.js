const htmlf = require("./thtml.js");
const querystring = require("querystring");

let textReceived = "";
let fileReceived = "";

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
  console.log("Received text: " + textReceived.slice(0, 1000) + (textReceived.length > 1000 ? "..." : ""));
  response.end(htmlf.upload({ text_received: textReceived }));
}

function file(response, postData) {
  let i = 0;
  let fileArray = [];

  // split the post data into an array of files by the boundary
  while (true) {
    bd1 = postData.indexOf("------WebKitFormBoundary", i);
    bd2 = postData.indexOf("------WebKitFormBoundary", bd1 + 1);
    if (bd2 === -1) {
      fileArray.push(postData.slice(bd1, postData.length));
      break;
    } else {
      fileArray.push(postData.slice(bd1, bd2));
    }
    i = bd2;
  }

  file = {};

  // find the first file in the array
  for (let i = 0; i < fileArray.length; i++) {
    if (fileArray[i].indexOf('filename="') !== -1) {
      fileArray = fileArray[i];
      break;
    }
  }

  // get the filename, filetype, and filedata
  file.filename = fileArray.slice(
    fileArray.indexOf('filename="') + 10,
    fileArray.indexOf('"\r\n', fileArray.indexOf('filename="'))
  );
  file.fileType = fileArray.slice(
    fileArray.indexOf("Content-Type: ") + 14,
    fileArray.indexOf("\r\n", fileArray.indexOf("Content-Type: "))
  );
  file.fileData = fileArray.slice(
    fileArray.indexOf("\r\n\r\n", fileArray.indexOf(file.fileType)) + 4,
    fileArray.indexOf("\r\n------")
  );

  // if there is no file, return the last file received
  // if there is no last file received further, return a blank file
  if (postData.indexOf('filename=""') !== -1) {
    let dataURL = "";
    if (!fileReceived.filename) {
      dataURL = "data:notype;base64,=";
    } else {
      dataURL = "data:" + fileReceived.fileType + ";base64," + fileReceived.fileData;
    }
    response.writeHead(200, { "Content-Type": "text/html;" });
    response.write(htmlf.file({ url: dataURL, filename: fileReceived.filename }));
    response.end();
    return;
  }
  console.log("file: " + file.filename + " has been received.");

  // convert the file data to base64
  let buffer = new ArrayBuffer(file.fileData.length);
  let view = new Uint8Array(buffer);
  for (let i = 0; i < file.fileData.length; i++) {
    view[i] = file.fileData.charCodeAt(i);
  }
  const buf = Buffer.from(file.fileData, "binary");
  file.fileData = buf.toString("base64");
  fileReceived = file;
  let dataURL = "data:" + file.fileType + ";base64," + file.fileData;
  response.writeHead(200, { "Content-Type": "text/html" });
  response.write(htmlf.file({ url: dataURL, filename: file.filename }));
  response.end();
}

exports.start = start;
exports.upload = upload;
exports.file = file;
