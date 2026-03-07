const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const { RUNTIME_LOGS_DIR, upsertProject } = require('./runtimeRegistry');

const processes = new Map();

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

function startProcess(project, handlers = {}) {
  const {
    onLog = () => {},
    onExit = () => {},
  } = handlers;

  const projectName = project.name;
  const startCommand = project.startCommand;
  const projectPath = project.path;
  const port = Number(project.port);

  if (!startCommand) {
    throw new Error(`Missing start command for project "${projectName}"`);
  }

  const logFile = path.join(RUNTIME_LOGS_DIR, `${projectName}.log`);
  fs.mkdirSync(path.dirname(logFile), { recursive: true });

  onLog('system', `Starting process: ${startCommand}`);

  const nodeBinPath = path.join(projectPath, 'node_modules', '.bin');
  const pathKey = process.platform === 'win32' ? 'Path' : 'PATH';
  const existingPath = (project.env || {})[pathKey] || process.env[pathKey] || '';

  const shell = getShellInvocation(startCommand);
  const proc = spawn(shell.bin, shell.args, {
    cwd: projectPath,
    env: {
      ...process.env,
      ...(project.env || {}),
      [pathKey]: `${nodeBinPath}${path.delimiter}${existingPath}`,
      PORT: String(port),
      NODE_ENV: 'production',
    },
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  const stream = fs.createWriteStream(logFile, { flags: 'a' });
  const outBuffer = { value: '' };
  const errBuffer = { value: '' };

  proc.stdout.on('data', chunk => {
    stream.write(chunk);
    emitBufferedLines(outBuffer, chunk, line => onLog('stdout', line));
  });

  proc.stderr.on('data', chunk => {
    stream.write(chunk);
    emitBufferedLines(errBuffer, chunk, line => onLog('stderr', line));
  });

  proc.on('error', err => onLog('stderr', `Process error: ${err.message}`));

  proc.on('exit', (code, signal) => {
    if (outBuffer.value) onLog('stdout', outBuffer.value);
    if (errBuffer.value) onLog('stderr', errBuffer.value);

    const entry = processes.get(projectName);
    if (entry && entry.process.pid === proc.pid) {
      processes.delete(projectName);
    }

    stream.end();

    const status = code === 0 || signal === 'SIGTERM' ? 'stopped' : 'crashed';
    upsertProject(projectName, {
      status,
      pid: null,
      exitedAt: new Date().toISOString(),
      exitCode: code,
      exitSignal: signal,
    });

    onExit({ code, signal, status });
  });

  processes.set(projectName, {
    process: proc,
    startedAt: new Date().toISOString(),
    logFile,
  });

  upsertProject(projectName, {
    status: 'starting',
    pid: proc.pid,
    logFile,
    startedAt: new Date().toISOString(),
    port,
    path: projectPath,
  });

  return new Promise((resolve, reject) => {
    let settled = false;

    const failEarly = (reason) => {
      if (settled) return;
      settled = true;
      reject(reason);
    };

    const okTimer = setTimeout(() => {
      if (settled) return;
      settled = true;
      upsertProject(projectName, {
        status: 'running',
        pid: proc.pid,
      });
      resolve(proc);
    }, 1000);

    proc.once('error', err => {
      clearTimeout(okTimer);
      failEarly(err);
    });

    proc.once('exit', (code, signal) => {
      clearTimeout(okTimer);
      failEarly(new Error(`Process exited early (code=${code}, signal=${signal})`));
    });
  });
}

function stopProcess(projectName, handlers = {}) {
  const { onLog = () => {} } = handlers;
  const entry = processes.get(projectName);
  if (!entry) return Promise.resolve(false);

  return new Promise(resolve => {
    let settled = false;

    const done = value => {
      if (settled) return;
      settled = true;
      resolve(value);
    };

    const timeout = setTimeout(() => {
      onLog('system', `Force killing process for ${projectName}`);
      try {
        entry.process.kill('SIGKILL');
      } catch (_) {
        // ignore
      }
      done(true);
    }, 10000);

    entry.process.once('exit', () => {
      clearTimeout(timeout);
      done(true);
    });

    onLog('system', `Stopping process for ${projectName}`);
    try {
      entry.process.kill('SIGTERM');
    } catch (_) {
      clearTimeout(timeout);
      done(false);
    }
  });
}

async function restartProcess(project, handlers = {}) {
  await stopProcess(project.name, handlers);
  return startProcess(project, handlers);
}

function getProcess(projectName) {
  return processes.get(projectName)?.process || null;
}

function getProcessMap() {
  return processes;
}

module.exports = {
  startProcess,
  stopProcess,
  restartProcess,
  getProcess,
  getProcessMap,
};
