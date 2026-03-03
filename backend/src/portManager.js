const net = require('net');
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const START = parseInt(process.env.APP_PORT_START) || 5000;
const END   = parseInt(process.env.APP_PORT_END)   || 5999;

function isPortFree(port) {
  return new Promise(resolve => {
    const s = net.createServer();
    s.once('error', () => resolve(false));
    s.once('listening', () => { s.close(); resolve(true); });
    s.listen(port, '127.0.0.1');
  });
}

async function getFreePort() {
  for (let p = START; p <= END; p++) {
    if (await isPortFree(p)) return p;
  }
  throw new Error('No free ports available in range');
}

module.exports = { getFreePort };
