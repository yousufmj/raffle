import { isFailure, isSuccess  } from '../../src/utils/responses';
import mocks from 'node-mocks-http';

describe('HTTP responses', () => {

    let res;

    beforeEach(() => {
        res = mocks.createResponse({
            eventEmitter: require('events').EventEmitter
        });
    });

    test('Should return success ', () => {


        res.httpCode = 200;
        let message = 'Test message';

        isSuccess(res, message);
        const successResponse = JSON.parse(res._getData());

        expect(successResponse.success).toBeTruthy();
        expect(successResponse.message).toEqual(message);
        expect(res.statusCode).toEqual(res.httpCode);
    });

    test('Should return 200 if no success status code ', () => {


        let message = 'Test message';

        isSuccess(res, message);
        const successResponse = JSON.parse(res._getData());

        expect(successResponse.success).toBeTruthy();
        expect(successResponse.message).toEqual(message);
        expect(res.statusCode).toEqual(200);
    });

    test('Should return failed message', () => {


        let errorMessage = 'Not Working Test';
        res.httpCode = 404;
        isFailure(res, errorMessage);

        const errorResponse = JSON.parse(res._getData());

        expect(errorResponse.success).toBeFalsy();
        expect(errorResponse.error).toEqual(errorMessage);
        expect(res.statusCode).toEqual(res.httpCode);
    });

    test('Should return 400 if no status', () => {

        let errorMessage = 'Broken';
        isFailure(res, errorMessage);

        const errorResponse = JSON.parse(res._getData());

        expect(errorResponse.success).toBeFalsy();
        expect(errorResponse.error).toEqual(errorMessage);
        expect(res.statusCode).toEqual(400);
    });

    test('Should add message if 404 an no error', () => {

        res.httpCode = 404;
        isFailure(res);

        const errorResponse = JSON.parse(res._getData());

        expect(errorResponse.success).toBeFalsy();
        expect(errorResponse.error).toEqual('Entry Not Found');
        expect(res.statusCode).toEqual(404);
    });
});