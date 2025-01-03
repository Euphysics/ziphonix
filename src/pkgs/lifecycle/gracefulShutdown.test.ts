import { setupGracefulShutdown } from './gracefulShutdown';

describe('setupGracefulShutdown', () => {
  it('should call shutdown and exit process on SIGINT', () => {
    const shutdown = vi.fn();
    // @ts-expect-error - process exit is readonly
    const exitSpy = vi.spyOn(process, 'exit').mockImplementation(() => {});

    setupGracefulShutdown(shutdown);

    process.emit('SIGINT');

    expect(shutdown).toHaveBeenCalled();
    expect(exitSpy).toHaveBeenCalledWith(0);

    exitSpy.mockRestore();
  });

  it('should call shutdown and exit process on SIGTERM', () => {
    const shutdown = vi.fn();
    // @ts-expect-error - process exit is readonly
    const exitSpy = vi.spyOn(process, 'exit').mockImplementation(() => {});

    setupGracefulShutdown(shutdown);

    process.emit('SIGTERM');

    expect(shutdown).toHaveBeenCalled();
    expect(exitSpy).toHaveBeenCalledWith(0);

    exitSpy.mockRestore();
  });
});
