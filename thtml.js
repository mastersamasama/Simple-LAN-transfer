const fs = require("fs");

function index(data = {}) {
  let html = fs.readFileSync("./index.html", "utf8");
  for (const key in data) {
    html = html.replace(`[data_${key}]`, data[key]);
  }
  return html;
}

function upload(data = {}) {
  let html = fs.readFileSync("./upload.html", "utf8");
  for (const key in data) {
    html = html.replace(`[data_${key}]`, data[key]);
  }
  return html;
}

function file(data = {}) {
  let html = fs.readFileSync("./file.html", "utf8");
  for (const key in data) {
    html = html.replace(`[data_${key}]`, data[key]);
  }
  return html;
}

exports.index = index;
exports.upload = upload;
exports.file = file;
