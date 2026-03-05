#!/usr/bin/env node

const { program } = require('commander');
const chalk = require('chalk');
const { getBaseUrl } = require('./utils/apiClient');
const { setServer, loadConfig, CONFIG_PATH } = require('./utils/config');

async function runCommand(handler, ...args) {
  try {
    await handler(...args);
  } catch (err) {
    console.error(chalk.red(`Error: ${err.message}`));
    process.exitCode = 1;
  }
}

program
  .name('minishinobi')
  .description('MiniShinobi CLI - control deployments and runtime apps from your terminal')
  .version('1.0.0');

program
  .command('deploy <repo>')
  .description('Deploy a repository URL')
  .option('--ref <git-ref>', 'Git ref to deploy', 'refs/heads/main')
  .option('--no-follow', 'Do not stream logs after queuing deployment')
  .action((repo, options) => runCommand(require('./commands/deploy'), repo, options));

program
  .command('apps')
  .description('List deployed apps')
  .action(() => runCommand(require('./commands/apps')));

program
  .command('logs <project>')
  .description('Stream logs for a project')
  .action(project => runCommand(require('./commands/logs'), project));

program
  .command('restart <project>')
  .description('Restart an app')
  .action(project => runCommand(require('./commands/restart'), project));

program
  .command('stop <project>')
  .description('Stop an app')
  .action(project => runCommand(require('./commands/stop'), project));

program
  .command('remove <project>')
  .description('Remove an app (stop + remove app dir + remove nginx route)')
  .action(project => runCommand(require('./commands/remove'), project));

const config = program
  .command('config')
  .description('Manage CLI configuration');

config
  .command('set-server <url>')
  .description('Set MiniShinobi controller URL')
  .action(url => runCommand(async () => {
    const next = setServer(url);
    console.log(chalk.green(`Server updated to ${next.server}`));
    console.log(chalk.gray(`Config file: ${CONFIG_PATH}`));
  }));

config
  .command('show')
  .description('Show active CLI configuration')
  .action(() => runCommand(async () => {
    const cfg = loadConfig();
    console.log(chalk.cyan('MiniShinobi CLI config'));
    console.log(`server: ${cfg.server}`);
    console.log(`active base URL: ${getBaseUrl()}`);
    console.log(`config path: ${CONFIG_PATH}`);
  }));

program.parse(process.argv);

