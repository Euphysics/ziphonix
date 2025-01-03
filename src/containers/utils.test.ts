import { Container } from 'inversify';

import { bindIfNotBound } from './utils';

describe('bindIfNotBound', () => {
  let container: Container;

  beforeEach(() => {
    container = new Container();
  });

  it('should bind a service as Singleton if not already bound', () => {
    const SERVICE_IDENTIFIER = Symbol('TestService');
    class TestService {}

    bindIfNotBound(container, SERVICE_IDENTIFIER, TestService);

    expect(container.isBound(SERVICE_IDENTIFIER)).toBe(true);
    const instance1 = container.get(SERVICE_IDENTIFIER);
    const instance2 = container.get(SERVICE_IDENTIFIER);
    expect(instance1).toBe(instance2); // Singleton scope: same instance
  });

  it('should not re-bind a service if already bound', () => {
    const SERVICE_IDENTIFIER = Symbol('TestService');
    class TestService {}
    class AnotherService {}

    container.bind(SERVICE_IDENTIFIER).to(AnotherService);

    bindIfNotBound(container, SERVICE_IDENTIFIER, TestService);

    const instance = container.get(SERVICE_IDENTIFIER);
    expect(instance).toBeInstanceOf(AnotherService); // Original binding remains
  });

  it('should bind a service as Transient if specified', () => {
    const SERVICE_IDENTIFIER = Symbol('TestService');
    class TestService {}

    bindIfNotBound(container, SERVICE_IDENTIFIER, TestService, 'Transient');

    expect(container.isBound(SERVICE_IDENTIFIER)).toBe(true);
    const instance1 = container.get(SERVICE_IDENTIFIER);
    const instance2 = container.get(SERVICE_IDENTIFIER);
    expect(instance1).not.toBe(instance2); // Transient scope: different instances
  });

  it('should not modify the container if service is already bound', () => {
    const SERVICE_IDENTIFIER = Symbol('TestService');
    class TestService {}

    container.bind(SERVICE_IDENTIFIER).to(TestService).inSingletonScope();

    bindIfNotBound(container, SERVICE_IDENTIFIER, TestService);

    const instance1 = container.get(SERVICE_IDENTIFIER);
    const instance2 = container.get(SERVICE_IDENTIFIER);
    expect(instance1).toBe(instance2); // Still Singleton, no change
  });
});
