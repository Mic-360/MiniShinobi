const { spawn } = require('child_process');
const path = require('path');

const DEFAULT_COMMAND_TIMEOUT_MS = 30 * 60 * 1000;
const DEFAULT_IDLE_TIMEOUT_MS = 10 * 60 * 1000;
const DEFAULT_HEARTBEAT_MS = 20 * 1000;

function getShellInvocation(command) {
  if (process.platform === 'win32') {
    return { bin: 'cmd.exe', args: ['/d', '/s', '/c', command] };
  }
  return { bin: 'sh', args: ['-c', command] };
}

function parsePositiveInt(value, fallback) {
  const num = Number(value);
  return Number.isFinite(num) && num > 0 ? Math.floor(num) : fallback;
}

function emitBufferedLines(buffer, chunk, onLine) {
  buffer.value += chunk.toString();
  const lines = buffer.value.split('\n');
  buffer.value = lines.pop() || '';
  lines.forEach(line => onLine(line));
}

function runCommand({
  command,
  cwd,
  env = {},
  onLog = () => {},
  commandTimeoutMs,
  idleTimeoutMs,
  heartbeatMs,
}) {
  return new Promise((resolve, reject) => {
    onLog('system', `$ ${command}`);

    const timeoutMs = parsePositiveInt(
      commandTimeoutMs || process.env.BUILD_COMMAND_TIMEOUT_MS,
      DEFAULT_COMMAND_TIMEOUT_MS
    );
    const outputIdleMs = parsePositiveInt(
      idleTimeoutMs || process.env.BUILD_IDLE_TIMEOUT_MS,
      DEFAULT_IDLE_TIMEOUT_MS
    );
    const pulseMs = parsePositiveInt(
      heartbeatMs || process.env.BUILD_HEARTBEAT_MS,
      DEFAULT_HEARTBEAT_MS
    );

    const startedAt = Date.now();
    let lastOutputAt = startedAt;

    const shell = getShellInvocation(command);
    const proc = spawn(shell.bin, shell.args, {
      cwd,
      env: {
        ...process.env,
        PATH: `${path.join(cwd, 'node_modules', '.bin')}${path.delimiter}${process.env.PATH || ''}`,
        NO_COLOR: '1',
        FORCE_COLOR: '0',
        CI: 'true',
        NPM_CONFIG_AUDIT: 'false',
        NPM_CONFIG_FUND: 'false',
        NPM_CONFIG_PROGRESS: 'false',
        ...env,
      },
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    const stdoutBuffer = { value: '' };
    const stderrBuffer = { value: '' };
    let settled = false;
    let commandTimer = null;
    let idleTimer = null;
    let heartbeatTimer = null;

    const clearTimers = () => {
      if (commandTimer) clearTimeout(commandTimer);
      if (idleTimer) clearTimeout(idleTimer);
      if (heartbeatTimer) clearInterval(heartbeatTimer);
    };

    const rejectAndTerminate = reason => {
      if (settled) return;
      settled = true;
      clearTimers();
      onLog('stderr', reason.message);

      try {
        proc.kill('SIGTERM');
      } catch (_) {
        // ignore
      }

      setTimeout(() => {
        try {
          proc.kill('SIGKILL');
        } catch (_) {
          // ignore
        }
      }, 5000);

      reject(reason);
    };

    const resetIdleTimer = () => {
      if (!outputIdleMs) return;
      if (idleTimer) clearTimeout(idleTimer);
      idleTimer = setTimeout(() => {
        const idleSec = Math.floor((Date.now() - lastOutputAt) / 1000);
        rejectAndTerminate(
          new Error(
            `"${command}" produced no output for ${idleSec}s and was terminated. ` +
              'Check network/npm registry access on the host and try running the command manually in the app directory.'
          )
        );
      }, outputIdleMs);
    };

    commandTimer = setTimeout(() => {
      const elapsedSec = Math.floor((Date.now() - startedAt) / 1000);
      rejectAndTerminate(
        new Error(
          `"${command}" exceeded timeout (${elapsedSec}s > ${Math.floor(timeoutMs / 1000)}s) and was terminated.`
        )
      );
    }, timeoutMs);

    heartbeatTimer = setInterval(() => {
      const elapsedSec = Math.floor((Date.now() - startedAt) / 1000);
      const idleSec = Math.floor((Date.now() - lastOutputAt) / 1000);
      onLog('system', `Command still running (${elapsedSec}s elapsed, ${idleSec}s since last output)`);
    }, pulseMs);

    resetIdleTimer();

    proc.stdout.on('data', chunk => {
      lastOutputAt = Date.now();
      resetIdleTimer();
      emitBufferedLines(stdoutBuffer, chunk, line => onLog('stdout', line));
    });

    proc.stderr.on('data', chunk => {
      lastOutputAt = Date.now();
      resetIdleTimer();
      emitBufferedLines(stderrBuffer, chunk, line => onLog('stderr', line));
    });

    proc.on('error', err => {
      if (settled) return;
      settled = true;
      clearTimers();
      reject(err);
    });

    proc.on('close', code => {
      if (settled) return;
      settled = true;
      clearTimers();
      if (stdoutBuffer.value) onLog('stdout', stdoutBuffer.value);
      if (stderrBuffer.value) onLog('stderr', stderrBuffer.value);
      if (code === 0) return resolve();
      reject(new Error(`"${command}" exited with code ${code}`));
    });
  });
}

module.exports = { runCommand };