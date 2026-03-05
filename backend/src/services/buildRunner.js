const { spawn } = require('child_process');
const path = require('path');

function getShellInvocation(command) {
  if (process.platform === 'win32') {
    return { bin: 'cmd.exe', args: ['/d', '/s', '/c', command] };
  }
  return { bin: 'sh', args: ['-c', command] };
}

function emitBufferedLines(buffer, chunk, onLine) {
  buffer.value += chunk.toString();
  const lines = buffer.value.split('\n');
  buffer.value = lines.pop() || '';
  lines.forEach(line => onLine(line));
}

function runCommand({ command, cwd, env = {}, onLog = () => {} }) {
  return new Promise((resolve, reject) => {
    onLog('system', `$ ${command}`);
    const shell = getShellInvocation(command);
    const proc = spawn(shell.bin, shell.args, {
      cwd,
      env: {
        ...process.env,
        PATH: `${path.join(cwd, 'node_modules', '.bin')}${path.delimiter}${process.env.PATH || ''}`,
        NO_COLOR: '1',
        FORCE_COLOR: '0',
        CI: 'true',
        ...env,
      },
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    const stdoutBuffer = { value: '' };
    const stderrBuffer = { value: '' };

    proc.stdout.on('data', chunk => emitBufferedLines(stdoutBuffer, chunk, line => onLog('stdout', line)));
    proc.stderr.on('data', chunk => emitBufferedLines(stderrBuffer, chunk, line => onLog('stderr', line)));

    proc.on('error', reject);
    proc.on('close', code => {
      if (stdoutBuffer.value) onLog('stdout', stdoutBuffer.value);
      if (stderrBuffer.value) onLog('stderr', stderrBuffer.value);
      if (code === 0) return resolve();
      reject(new Error(`"${command}" exited with code ${code}`));
    });
  });
}

module.exports = { runCommand };
