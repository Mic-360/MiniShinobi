const chalk = require('chalk');
const Table = require('cli-table3');
const api = require('../utils/apiClient');

module.exports = async function appsCommand() {
  const data = await api.request('get', '/apps');
  const apps = data.apps || [];

  if (!apps.length) {
    console.log(chalk.yellow('No deployed apps found.'));
    return;
  }

  const table = new Table({
    head: ['PROJECT', 'PORT', 'STATUS', 'HOST'],
    style: { head: ['cyan'] },
  });

  apps.forEach(app => {
    const status = app.status === 'running' ? chalk.green(app.status) : chalk.yellow(app.status);
    table.push([app.project, app.port || '-', status, app.host || '-']);
  });

  console.log(table.toString());
};
