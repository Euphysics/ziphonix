import type { Container } from 'inversify';

export const bindIfNotBound = <T>(
  container: Container,
  serviceIdentifier: symbol,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  implementation: new (...args: any[]) => T,
  scope: 'Singleton' | 'Transient' = 'Singleton',
) => {
  if (!container.isBound(serviceIdentifier)) {
    const binding = container.bind<T>(serviceIdentifier).to(implementation);
    if (scope === 'Singleton') {
      binding.inSingletonScope();
    } else {
      binding.inTransientScope();
    }
  }
};
