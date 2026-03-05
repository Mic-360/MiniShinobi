const chalk = require('chalk');
const api = require('../utils/apiClient');

module.exports = async function removeCommand(project) {
  if (!project) {
    throw new Error('Project name is required. Usage: minishinobi remove <project>');
  }

  const response = await api.request('delete', `/apps/${encodeURIComponent(project)}`);
  console.log(chalk.green(`Removed ${response.project}.`));
};
