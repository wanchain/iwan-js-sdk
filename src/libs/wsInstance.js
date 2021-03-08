let isPC = false;
try {
  typeof(WebSocket) === "undefined" ? (isPC = true) : (isPC = false);
} catch (err) {
  isPC = true;
}

if (isPC) {
    module.exports = require("./wsInstancePC");
} else {
    module.exports = require("./wsInstanceWeb");
}
