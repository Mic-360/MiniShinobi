const chalk = require('chalk');
const api = require('../utils/apiClient');

module.exports = async function restartCommand(project) {
  if (!project) {
    throw new Error('Project name is required. Usage: minishinobi restart <project>');
  }

  const response = await api.request('post', `/apps/${encodeURIComponent(project)}/restart`);
  console.log(chalk.green(`Restarted ${response.project}.`));
};
