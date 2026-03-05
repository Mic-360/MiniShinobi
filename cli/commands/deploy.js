const chalk = require('chalk');
const api = require('../utils/apiClient');

function renderEvent(payloadRaw) {
  if (!payloadRaw) return;

  try {
    const payload = JSON.parse(payloadRaw);
    const stream = payload.stream || 'system';
    const message = payload.message || '';

    if (stream === 'stderr') {
      console.error(chalk.red(message));
    } else if (stream === 'system') {
      console.log(chalk.cyan(message));
    } else {
      console.log(message);
    }
  } catch (_) {
    console.log(payloadRaw);
  }
}

function createSseParser(onEvent) {
  let buffer = '';

  return (chunk) => {
    buffer += chunk;

    let splitIndex = buffer.indexOf('\n\n');
    while (splitIndex !== -1) {
      const eventChunk = buffer.slice(0, splitIndex);
      buffer = buffer.slice(splitIndex + 2);

      eventChunk
        .split('\n')
        .filter(line => line.startsWith('data:'))
        .forEach(line => onEvent(line.slice(5).trim()));

      splitIndex = buffer.indexOf('\n\n');
    }
  };
}

module.exports = async function deployCommand(repo, options = {}) {
  if (!repo) {
    throw new Error('Repository URL is required. Usage: minishinobi deploy <git-repo-url>');
  }

  console.log(chalk.cyan(`Deploying ${repo}...`));

  const response = await api.request('post', '/deploy', {
    repo,
    ref: options.ref || 'refs/heads/main',
  });

  const deploymentId = response.deploymentId;
  const project = response.project;

  console.log(chalk.green(`Deployment queued (id=${deploymentId}, project=${project})`));

  if (options.noFollow) {
    return;
  }

  console.log(chalk.cyan(`Streaming logs for ${project} (Ctrl+C to exit)...`));

  const parse = createSseParser(renderEvent);
  const stream = await api.stream(`/logs/${project}?deploymentId=${deploymentId}`, {
    onData: parse,
  });

  process.once('SIGINT', () => {
    try {
      stream.destroy();
    } catch (_) {
      // ignore
    }
    process.exit(0);
  });
};
