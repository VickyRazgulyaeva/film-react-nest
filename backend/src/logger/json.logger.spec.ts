import { JsonLogger } from './json.logger';

describe('JsonLogger', () => {
  let logger: JsonLogger;

  beforeEach(() => {
    logger = new JsonLogger();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('writes log message in JSON format', () => {
    const spy = jest.spyOn(console, 'log').mockImplementation();

    logger.log('Server started', 'App');

    expect(spy).toHaveBeenCalledWith(
      JSON.stringify({
        level: 'log',
        message: 'Server started',
        optionalParams: ['App'],
      }),
    );
  });

  it('writes error message in JSON format', () => {
    const spy = jest.spyOn(console, 'error').mockImplementation();

    logger.error('Something went wrong', 'App');

    expect(spy).toHaveBeenCalledWith(
      JSON.stringify({
        level: 'error',
        message: 'Something went wrong',
        optionalParams: ['App'],
      }),
    );
  });

  it('writes warn message in JSON format', () => {
    const spy = jest.spyOn(console, 'warn').mockImplementation();

    logger.warn('Warning message');

    expect(spy).toHaveBeenCalledWith(
      JSON.stringify({
        level: 'warn',
        message: 'Warning message',
        optionalParams: [],
      }),
    );
  });
});
