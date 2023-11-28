// We are obtaining general cache by creating one NodeCache instance
const NodeCache = require("node-cache");
const cache = new NodeCache();

module.exports = cache;