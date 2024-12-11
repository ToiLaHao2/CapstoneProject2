const { sendError } = require("./response");

function requestCheck(res, data) {
  if (data == null) sendError(res, 400, "No data");
}

module.exports = { requestCheck };
