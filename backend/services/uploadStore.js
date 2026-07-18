const uploads = new Map();
function addUpload(item) {
  uploads.set(item.uploadId, item);
  return item;
}
function getUpload(uploadId) {
  return uploads.get(uploadId);
}
module.exports = { addUpload, getUpload };
