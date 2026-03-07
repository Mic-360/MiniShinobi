import { useEffect, useRef, useState } from 'react';

export function TerminalLog({
  logs = [],
  isStreaming = false,
  onCopy,
  isErrored = false,
}) {
  const containerRef = useRef(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [logs]);

  const handleCopy = () => {
    const text = logs.map((log) => log.message).join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    onCopy?.();
  };

  const getStreamColor = (stream) => {
    switch (stream) {
      case 'stderr':
        return 'text-mocha-error';
      case 'system':
        return 'text-mocha-info';
      default:
        return 'text-mocha-success';
    }
  };

  const isDone =
    logs.length > 0 && logs[logs.length - 1].message?.includes('[END]');

  return (
    <div
      className={`flex flex-col h-full bg-mocha-bg border border-mocha-surface rounded-2xl overflow-hidden shadow-2xl transition-all duration-250 ${isErrored ? 'border-mocha-error shadow-mocha-error' : ''}`}
    >
      {/* Header */}
      <div className='flex items-center justify-between px-5 py-4 border-b border-mocha-surface bg-gradient-to-b from-mocha-surface to-transparent'>
        <div className='flex items-center gap-3 font-mono text-sm font-medium text-mocha-text tracking-wide'>
          <span className='text-lg text-mocha-success'>▲</span>
          <span>Deployment Logs</span>
        </div>
        {logs.length > 0 && (
          <button
            onClick={handleCopy}
            className={`px-3.5 py-2 bg-mocha-surface text-mocha-subtext border border-mocha-overlay rounded-lg text-sm font-mono font-medium hover:bg-mocha-overlay hover:text-mocha-success hover:border-mocha-success transition-all duration-150 ${copied ? 'text-mocha-success border-mocha-success' : ''}`}
            title='Copy logs'
          >
            {copied ? '✓ Copied' : 'Copy'}
          </button>
        )}
      </div>

      {/* Content */}
      <div
        ref={containerRef}
        className='flex-1 overflow-y-auto overflow-x-hidden px-5 py-5 font-mono text-sm leading-relaxed scroll-smooth'
      >
        {logs.length === 0 ? (
          <div className='flex flex-col items-center justify-center h-full gap-4 text-mocha-subtext'>
            <div className='flex gap-1 items-center'>
              <div className='w-1.5 h-1.5 bg-mocha-success rounded-full animate-loader-dot'></div>
              <div
                className='w-1.5 h-1.5 bg-mocha-success rounded-full animate-loader-dot'
                style={{ animationDelay: '0.2s' }}
              ></div>
              <div
                className='w-1.5 h-1.5 bg-mocha-success rounded-full animate-loader-dot'
                style={{ animationDelay: '0.4s' }}
              ></div>
            </div>
            <p>Waiting for deployment...</p>
          </div>
        ) : (
          <pre className='m-0 p-0 font-mono text-mocha-text whitespace-pre-wrap break-words'>
            {logs.map((log, idx) => (
              <div
                key={idx}
                className={`py-1 animate-slide-in-left ${getStreamColor(log.stream)}`}
                data-timestamp={new Date(log.ts).toLocaleTimeString()}
              >
                <span className='whitespace-pre-wrap break-words'>
                  {log.message}
                </span>
              </div>
            ))}
            {isDone && (
              <div className='py-1.5 mt-3 pt-3 border-t border-mocha-surface font-medium text-mocha-success'>
                <span>✓ Deployment complete</span>
              </div>
            )}
            {isStreaming && !isDone && (
              <div className='py-1 text-mocha-success animate-pulse-subtle'>
                <span className='inline-block animate-blink'>▌</span>
              </div>
            )}
          </pre>
        )}
      </div>

      {/* Footer */}
      <div className='flex items-center justify-between px-5 py-3 border-t border-mocha-surface bg-black/50 font-mono text-xs text-mocha-subtext'>
        <div className='flex items-center gap-2'>
          {isStreaming && !isDone ? (
            <>
              <span className='w-2 h-2 bg-mocha-info rounded-full animate-status-pulse'></span>
              <span className='text-mocha-text font-medium'>Streaming...</span>
            </>
          ) : isDone ? (
            <>
              <span className='w-2 h-2 bg-mocha-success rounded-full'></span>
              <span className='text-mocha-text font-medium'>Completed</span>
            </>
          ) : (
            <>
              <span className='w-2 h-2 bg-mocha-warning rounded-full'></span>
              <span className='text-mocha-text font-medium'>Connecting...</span>
            </>
          )}
        </div>
        <span className='text-mocha-subtext'>{logs.length} lines</span>
      </div>
    </div>
  );
}
