const axios = require('axios');
const { loadConfig } = require('./config');

function getBaseUrl() {
  const cfg = loadConfig();
  return process.env.MINISHINOBI_HOST || cfg.server || 'http://localhost:3000';
}

function getHeaders(extra = {}) {
  const headers = { ...extra };
  if (process.env.MINISHINOBI_SECRET) {
    headers['x-minishinobi-secret'] = process.env.MINISHINOBI_SECRET;
  }
  return headers;
}

function getClient() {
  return axios.create({
    baseURL: getBaseUrl(),
    timeout: 30000,
  });
}

function normalizeError(err) {
  if (err.response) {
    const message = err.response.data?.error || err.response.data?.message || err.message;
    return new Error(`Request failed (${err.response.status}): ${message}`);
  }
  if (err.request) {
    return new Error(`Server unreachable at ${getBaseUrl()}`);
  }
  return new Error(err.message || 'Unknown request error');
}

async function request(method, url, data = undefined, options = {}) {
  const client = getClient();
  try {
    const response = await client.request({
      method,
      url,
      data,
      ...options,
      headers: getHeaders(options.headers || {}),
    });
    return response.data;
  } catch (err) {
    throw normalizeError(err);
  }
}

async function stream(url, handlers = {}) {
  const client = getClient();
  const {
    onData = () => {},
    onEnd = () => {},
  } = handlers;

  try {
    const response = await client.get(url, {
      responseType: 'stream',
      headers: getHeaders({ Accept: 'text/event-stream' }),
    });

    response.data.on('data', chunk => onData(chunk.toString()));
    response.data.on('end', () => onEnd());
    response.data.on('close', () => onEnd());
    return response.data;
  } catch (err) {
    throw normalizeError(err);
  }
}

module.exports = {
  getBaseUrl,
  request,
  stream,
};
