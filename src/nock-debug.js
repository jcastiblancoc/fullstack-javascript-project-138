import debug from 'debug';
import nock from 'nock';

const nockDebug = debug('nock');

nock.recorder.rec({
    logging: (content) => nockDebug(`🎯 Nock log: ${content}`),
});
