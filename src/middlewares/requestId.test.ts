import { v7 } from 'uuid';

import { requestId } from '@/middlewares/requestId';

import type { Context } from 'hono';
import type { Mock, Mocked } from 'vitest';

vi.mock('uuid', () => ({
  v7: vi.fn(),
}));

describe('requestId middleware', () => {
  let mockContext: Mocked<Context>;
  let next: Mock;

  beforeEach(() => {
    mockContext = {
      set: vi.fn(),
      header: vi.fn(),
    } as unknown as Mocked<Context>;
    next = vi.fn().mockResolvedValue(undefined);
    vi.resetAllMocks();
  });

  it('should generate a unique request ID and set it in context and headers', async () => {
    const mockRequestId = 'unique-request-id';
    (v7 as Mock).mockReturnValue(mockRequestId);

    const middleware = requestId();

    await middleware(mockContext, next);

    expect(v7).toHaveBeenCalled();
    expect(mockContext.set).toHaveBeenCalledWith('requestId', mockRequestId);
    expect(mockContext.header).toHaveBeenCalledWith(
      'X-Request-ID',
      mockRequestId,
    );
    expect(next).toHaveBeenCalled();
  });

  it('should call the next middleware', async () => {
    const middleware = requestId();

    await middleware(mockContext, next);

    expect(next).toHaveBeenCalled();
  });
});
