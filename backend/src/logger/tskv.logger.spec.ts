import { TskvLogger } from './tskv.logger';

describe('TskvLogger', () => {
  let logger: TskvLogger;

  beforeEach(() => {
    logger = new TskvLogger();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('writes log message in TSKV format', () => {
    const spy = jest.spyOn(console, 'log').mockImplementation();

    logger.log('Server started', 'App');

    expect(spy).toHaveBeenCalledWith(
      'level=log\tmessage=Server started\toptionalParams=["App"]',
    );
  });

  it('writes error message in TSKV format', () => {
    const spy = jest.spyOn(console, 'error').mockImplementation();

    logger.error('Something went wrong', 'App');

    expect(spy).toHaveBeenCalledWith(
      'level=error\tmessage=Something went wrong\toptionalParams=["App"]',
    );
  });

  it('escapes tabs and new lines in TSKV values', () => {
    const spy = jest.spyOn(console, 'log').mockImplementation();

    logger.log('Hello\tworld\nnext line');

    expect(spy).toHaveBeenCalledWith(
      'level=log\tmessage=Hello\\tworld\\nnext line\toptionalParams=[]',
    );
  });
});
