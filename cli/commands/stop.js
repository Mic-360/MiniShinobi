const chalk = require('chalk');
const api = require('../utils/apiClient');

module.exports = async function stopCommand(project) {
  if (!project) {
    throw new Error('Project name is required. Usage: minishinobi stop <project>');
  }

  const response = await api.request('post', `/apps/${encodeURIComponent(project)}/stop`);
  console.log(chalk.green(`Stopped ${response.project}.`));
};
