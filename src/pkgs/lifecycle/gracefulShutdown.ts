export const setupGracefulShutdown = (shutdown: () => void) => {
  const handleShutdown = (signal: NodeJS.Signals) => {
    console.info(`${signal} signal received. Starting graceful shutdown.`);
    shutdown();
    console.info('Application successfully shut down.');
    process.exit(0);
  };

  process.on('SIGINT', handleShutdown);
  process.on('SIGTERM', handleShutdown);
};
